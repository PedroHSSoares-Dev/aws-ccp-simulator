import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { HomeScreen } from './components/HomeScreen';
import { ExamLayout } from './components/exam/ExamLayout';
import { ResultsScreen } from './components/results/ResultsScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
// import { AppHeader } from './components/ui/AppHeader';
import { useExamStore } from './stores/examStore';
import { useHistoryStore } from './stores/historyStore';
import { useSettingsStore } from './stores/settingsStore';
import { selectExamQuestions, selectQuickExamQuestions } from './lib/randomizer';
import { createExamAttempt } from './lib/scoring';
import { allQuestions } from './data/questionLoader';
import type {
  Question,
  ExamConfig,
  ExamAttempt,
  DomainKey,
  DomainId
} from './types';
import type { WrongAnswersConfig } from './components/modals/WrongAnswersConfigModal';
import type { PracticeModeConfig } from './components/modals/PracticeModeConfigModal';

type AppView = 'home' | 'exam' | 'results' | 'dashboard';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [loadedQuestions, setLoadedQuestions] = useState<Question[]>([]);

  // Store hooks
  const {
    startExam,
    config,
    startTime,
    answers,
    id: examId,
    resetExam,
    phase,
    questions: examQuestions,
  } = useExamStore();

  const { addAttempt, getRecentQuestionIds, getFilteredWrongQuestionIds } = useHistoryStore();
  const { setTheme, theme } = useSettingsStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load questions
  useEffect(() => {
    // In a real app we might fetch these
    setLoadedQuestions(allQuestions);
    setIsLoading(false);
  }, []);

  // Effect to handle view transitions based on exam state
  useEffect(() => {
    if (phase === 'in-progress' && examQuestions.length > 0) {
      setView('exam');
    } else if (phase === 'finished' && view === 'exam') {
      setView('results');
    }
  }, [phase, examQuestions, view]);

  // Handle starting an exam
  const handleStartExam = useCallback((
    mode: 'official' | 'practice' | 'quick' | 'wrong-answers',
    config?: WrongAnswersConfig | PracticeModeConfig
  ) => {
    setIsLoading(true);

    // Get recent question IDs to avoid (last 3 exams)
    const recentIds = getRecentQuestionIds(3);

    // Helper to extract domain key
    const getDomainKey = (domainId: DomainId): DomainKey => {
      const mapping: Record<DomainId, DomainKey> = {
        'domain1-cloud-concepts': 'domain1',
        'domain2-security': 'domain2',
        'domain3-technology': 'domain3',
        'domain4-billing': 'domain4',
      };
      return mapping[domainId];
    };

    // Give UI a moment to show loading state
    setTimeout(() => {
      try {
        let selectedQuestions: Question[] = [];
        let examConfig: ExamConfig;

        if (mode === 'official') {
          examConfig = {
            mode: 'official',
            duration: 90,
            totalQuestions: 65,
            distribution: { domain1: 16, domain2: 19, domain3: 22, domain4: 8 }, // Total 65 (AWS Standard)
            allowOvertime: false,
            showTimer: true,
          };
          selectedQuestions = selectExamQuestions(
            loadedQuestions,
            examConfig.distribution,
            recentIds
          );
        } else if (mode === 'practice') {
          examConfig = {
            mode: 'practice',
            duration: 0, // No time limit
            totalQuestions: (config as PracticeModeConfig)?.maxQuestions === 'all'
              ? 65 // Fallback to 65 if 'all' (will be clamped by actual questions)
              : ((config as PracticeModeConfig)?.maxQuestions as number) || 60,
            distribution: { domain1: 15, domain2: 18, domain3: 21, domain4: 6 }, // Default distribution
            allowOvertime: true,
            showTimer: false,
          };

          // If specific domains selected
          const practiceConfig = config as PracticeModeConfig | undefined;
          let practiceQuestions = loadedQuestions;

          if (practiceConfig?.selectedDomains && practiceConfig.selectedDomains.length > 0) {
            practiceQuestions = loadedQuestions.filter(q => {
              const domainKey = getDomainKey(q.domain);
              return practiceConfig.selectedDomains.includes(domainKey);
            });
          }

          // Use random selection from filtered questions
          selectedQuestions = selectExamQuestions(
            practiceQuestions,
            examConfig.distribution, // This might need adjustment if we filter domains strongly
            [] // Don't filter recents in practice
          ).slice(0, examConfig.totalQuestions);

          // If we selected fewer than requested (due to domain filtering), that's fine

        } else if (mode === 'wrong-answers') {
          // Default config if none provided (fallback)
          const waConfig = (config as WrongAnswersConfig) || {
            maxQuestions: 20,
            selectedDomains: ['domain1', 'domain2', 'domain3', 'domain4'] as DomainKey[],
            sortBy: 'recent' as const
          };

          const wrongIds = getFilteredWrongQuestionIds({
            domains: waConfig.selectedDomains,
            sortBy: waConfig.sortBy
          });

          if (wrongIds.length === 0) {
            alert("Você ainda não tem questões marcadas como erradas com estes filtros!");
            // Loading will be set to false in finally block if we return here? 
            // No, return inside try/finally executes finally before returning.
            // So this is safe, BUT we need to make sure we don't proceed to startExam.
            return;
          }

          // Apply limit
          let finalIds = wrongIds;
          if (waConfig.maxQuestions !== 'all') {
            finalIds = wrongIds.slice(0, waConfig.maxQuestions);
          }

          examConfig = {
            mode: 'wrong-answers',
            duration: 0, // No specific time limit
            totalQuestions: finalIds.length,
            distribution: { domain1: 0, domain2: 0, domain3: 0, domain4: 0 }, // Not relevant for this mode
            allowOvertime: true,
            showTimer: false,
          };

          // Map IDs back to questions
          const questionMap = new Map(loadedQuestions.map(q => [q.id, q]));
          selectedQuestions = finalIds.map(id => questionMap.get(id)).filter((q): q is Question => !!q);
        } else {
          examConfig = {
            mode: 'quick',
            duration: 30,
            totalQuestions: 20,
            distribution: { domain1: 5, domain2: 6, domain3: 7, domain4: 2 },
            allowOvertime: true,
            showTimer: true,
          };
          selectedQuestions = selectQuickExamQuestions(
            loadedQuestions,
            20,
            recentIds
          );
        }

        // Ensure we have enough questions (use what's available)
        if (selectedQuestions.length < examConfig.totalQuestions) {
          console.warn(`Only ${selectedQuestions.length} questions available`);
          examConfig.totalQuestions = selectedQuestions.length;
        }

        // Start the exam
        startExam(examConfig, selectedQuestions);
        setView('exam');
      } catch (error) {
        console.error("Failed to start exam:", error);
        alert("Ocorreu um erro ao iniciar o exame. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, [loadedQuestions, getRecentQuestionIds, getFilteredWrongQuestionIds, startExam]);

  // Handle finishing exam
  const handleFinishExam = useCallback(() => {
    if (!examId || !config || !startTime) return;

    // Create exam attempt record
    const attempt = createExamAttempt(
      examId,
      config.mode,
      examQuestions,
      answers,
      startTime,
      Date.now()
    );

    // Save to history
    addAttempt(attempt);

    // Reset exam store logic handled by store action if needed, or by simple navigation
    // We update view to results
    setView('results');
  }, [examId, config, startTime, answers, addAttempt]);

  const handleGoHome = useCallback(() => {
    resetExam();
    setView('home');
  }, [resetExam]);

  const handleViewDashboard = useCallback(() => {
    setView('dashboard');
  }, []);

  const handleRetakeExam = useCallback(() => {
    // Restart with same config - implementation simplified for now
    // Ideally we'd store the last config and reuse it
    handleGoHome();
  }, [handleGoHome]);
  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* Floating Header with Theme and Language Toggles */}
      {/* Header removed from here to be placed inside specific screens if needed, or we render it conditionally */}
      {/* <AppHeader /> */}

      {view === 'home' && (
        <HomeScreen
          onStartExam={handleStartExam}
          onViewDashboard={handleViewDashboard}
          onOpenSettings={() => { }}
        />
      )}

      {view === 'exam' && (
        <ExamLayout
          onFinish={handleFinishExam}
          onExit={handleGoHome}
        />
      )}

      {view === 'results' && (
        <React.Fragment>
          {/* We need to get the last attempt from history or compute it temporarily */}
          {/* For simplicity, we can fetch the latest from history store since we just added it */}
          {(() => {
            const { attempts } = useHistoryStore.getState();
            const latestAttempt = attempts[attempts.length - 1];

            if (!latestAttempt) return null;

            return (
              <ResultsScreen
                attempt={latestAttempt}
                questions={examQuestions}
                onNewExam={handleGoHome}
                onGoHome={handleGoHome}
                onViewDashboard={handleViewDashboard}
              />
            );
          })()}
        </React.Fragment>
      )}

      {view === 'dashboard' && (
        <DashboardScreen
          onBack={handleGoHome}
          questions={loadedQuestions}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
