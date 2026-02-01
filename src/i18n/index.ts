// ============================================================================
// i18n - Translation System
// ============================================================================

import { useSettingsStore } from '../stores/settingsStore';

export type Language = 'pt-BR' | 'en';

// Translation keys organized by component/screen
const translations = {
    // Common
    'common.loading': { 'pt-BR': 'Carregando...', 'en': 'Loading...' },
    'common.cancel': { 'pt-BR': 'Cancelar', 'en': 'Cancel' },
    'common.confirm': { 'pt-BR': 'Confirmar', 'en': 'Confirm' },
    'common.start': { 'pt-BR': 'Iniciar', 'en': 'Start' },
    'common.exit': { 'pt-BR': 'Sair', 'en': 'Exit' },
    'common.back': { 'pt-BR': 'Voltar', 'en': 'Back' },
    'common.next': { 'pt-BR': 'Próximo', 'en': 'Next' },
    'common.previous': { 'pt-BR': 'Anterior', 'en': 'Previous' },
    'common.finish': { 'pt-BR': 'Finalizar', 'en': 'Finish' },
    'common.questions': { 'pt-BR': 'questões', 'en': 'questions' },
    'common.minutes': { 'pt-BR': 'minutos', 'en': 'minutes' },

    // Home Screen
    'home.title': { 'pt-BR': 'AWS Cloud Practitioner', 'en': 'AWS Cloud Practitioner' },
    'home.subtitle': { 'pt-BR': 'Simulador de Exame CCP-02', 'en': 'CCP-02 Exam Simulator' },
    'home.description': {
        'pt-BR': 'Pratique com simulados realistas, acompanhe seu progresso e domine as habilidades necessárias para passar na certificação AWS CCP.',
        'en': 'Practice with realistic exam simulations, track your progress, and master the skills needed to pass the AWS CCP certification.'
    },
    'home.viewDashboard': { 'pt-BR': 'Ver Dashboard', 'en': 'View Dashboard' },
    'home.examsTaken': { 'pt-BR': 'Exames Feitos', 'en': 'Exams Taken' },
    'home.passRate': { 'pt-BR': 'Taxa de Aprovação', 'en': 'Pass Rate' },
    'home.bestScore': { 'pt-BR': 'Melhor Nota', 'en': 'Best Score' },

    // Exam Modes
    'mode.official': { 'pt-BR': 'Simulado Oficial', 'en': 'Official Exam' },
    'mode.official.desc': { 'pt-BR': '65 questões em 90 minutos', 'en': '65 questions in 90 minutes' },
    'mode.practice': { 'pt-BR': 'Modo Prática', 'en': 'Practice Mode' },
    'mode.practice.desc': { 'pt-BR': 'Aprenda no seu ritmo', 'en': 'Learn at your own pace' },
    'mode.quick': { 'pt-BR': 'Quiz Rápido', 'en': 'Quick Quiz' },
    'mode.quick.desc': { 'pt-BR': '20 questões em 30 minutos', 'en': '20 questions in 30 minutes' },
    'mode.mistakes': { 'pt-BR': 'Revisão de Erros', 'en': 'Mistakes Review' },
    'mode.mistakes.desc': { 'pt-BR': 'Refaça questões erradas', 'en': 'Retake missed questions' },

    // Tags
    'tag.timed': { 'pt-BR': 'Cronometrado', 'en': 'Timed' },
    'tag.randomized': { 'pt-BR': 'Aleatório', 'en': 'Randomized' },
    'tag.noTimer': { 'pt-BR': 'Sem Tempo', 'en': 'No Timer' },
    'tag.instantFeedback': { 'pt-BR': 'Feedback Instantâneo', 'en': 'Instant Feedback' },
    'tag.short': { 'pt-BR': 'Curto', 'en': 'Short' },
    'tag.review': { 'pt-BR': 'Revisão', 'en': 'Review' },
    'tag.focus': { 'pt-BR': 'Foco', 'en': 'Focus' },
    'tag.improvement': { 'pt-BR': 'Melhoria', 'en': 'Improvement' },

    // Domain Coverage
    'domains.title': { 'pt-BR': 'Cobertura por Domínio (CCP-02)', 'en': 'Domain Coverage (CCP-02)' },

    // Recent Attempts
    'history.recentAttempts': { 'pt-BR': 'Tentativas Recentes', 'en': 'Recent Attempts' },
    'history.viewAll': { 'pt-BR': 'Ver Todos', 'en': 'View All' },
    'history.passed': { 'pt-BR': 'Aprovado', 'en': 'Passed' },
    'history.notPassed': { 'pt-BR': 'Não Aprovado', 'en': 'Not Passed' },
    'history.correct': { 'pt-BR': 'corretas', 'en': 'correct' },

    // Footer
    'footer.disclaimer': {
        'pt-BR': 'Este simulador é apenas para fins de prática. Sempre consulte a documentação oficial da AWS e materiais de treinamento.',
        'en': 'This simulator is for practice purposes only. Always refer to official AWS documentation and training materials.'
    },

    // Exam Screen
    'exam.question': { 'pt-BR': 'Questão', 'en': 'Question' },
    'exam.of': { 'pt-BR': 'de', 'en': 'of' },
    'exam.exitExam': { 'pt-BR': 'Sair do Exame', 'en': 'Exit Exam' },
    'exam.markReview': { 'pt-BR': 'Marcar para Revisão', 'en': 'Mark for Review' },
    'exam.marked': { 'pt-BR': 'Marcada', 'en': 'Marked' },
    'exam.selectOne': { 'pt-BR': 'Selecione UMA opção', 'en': 'Select ONE option' },
    'exam.selectMultiple': { 'pt-BR': 'Selecione TODAS as opções corretas', 'en': 'Select ALL correct options' },
    'exam.finishExam': { 'pt-BR': 'Finalizar Exame', 'en': 'Finish Exam' },
    'exam.overtime': { 'pt-BR': 'Tempo Extra', 'en': 'Overtime' },

    // Exit Confirmation
    'exit.title': { 'pt-BR': 'Sair do Exame?', 'en': 'Exit Exam?' },
    'exit.message': { 'pt-BR': 'Todo o seu progresso será perdido. Tem certeza?', 'en': 'All your progress will be lost. Are you sure?' },
    'exit.confirm': { 'pt-BR': 'Sim, Sair', 'en': 'Yes, Exit' },

    // Finish Confirmation
    'finish.title': { 'pt-BR': 'Finalizar Exame?', 'en': 'Finish Exam?' },
    'finish.message': { 'pt-BR': 'Você ainda tem questões não respondidas. Deseja finalizar mesmo assim?', 'en': 'You still have unanswered questions. Do you want to finish anyway?' },
    'finish.confirm': { 'pt-BR': 'Sim, Finalizar', 'en': 'Yes, Finish' },

    // Results Screen
    'results.title': { 'pt-BR': 'Resultado do Exame', 'en': 'Exam Result' },
    'results.passed': { 'pt-BR': 'Aprovado!', 'en': 'Passed!' },
    'results.failed': { 'pt-BR': 'Não Aprovado', 'en': 'Not Passed' },
    'results.score': { 'pt-BR': 'Pontuação', 'en': 'Score' },
    'results.passingScore': { 'pt-BR': 'Nota de Aprovação', 'en': 'Passing Score' },
    'results.correctAnswers': { 'pt-BR': 'Respostas Corretas', 'en': 'Correct Answers' },
    'results.timeTaken': { 'pt-BR': 'Tempo Gasto', 'en': 'Time Taken' },
    'results.domainBreakdown': { 'pt-BR': 'Desempenho por Domínio', 'en': 'Domain Breakdown' },
    'results.wrongAnswers': { 'pt-BR': 'Questões Erradas', 'en': 'Wrong Answers' },
    'results.backHome': { 'pt-BR': 'Voltar ao Início', 'en': 'Back to Home' },
    'results.tryAgain': { 'pt-BR': 'Tentar Novamente', 'en': 'Try Again' },

    // Dashboard
    'dashboard.title': { 'pt-BR': 'Dashboard de Progresso', 'en': 'Progress Dashboard' },
    'dashboard.evolution': { 'pt-BR': 'Evolução das Notas', 'en': 'Score Evolution' },
    'dashboard.domainPerformance': { 'pt-BR': 'Desempenho por Domínio', 'en': 'Domain Performance' },
    'dashboard.weakPoints': { 'pt-BR': 'Pontos Fracos', 'en': 'Weak Points' },
    'dashboard.recommendations': { 'pt-BR': 'Recomendações', 'en': 'Recommendations' },
    'dashboard.totalExams': { 'pt-BR': 'Total de Exames', 'en': 'Total Exams' },
    'dashboard.avgScore': { 'pt-BR': 'Nota Média', 'en': 'Average Score' },
    'dashboard.clearHistory': { 'pt-BR': 'Limpar Histórico', 'en': 'Clear History' },

    // Wrong Answers Modal
    'wrongAnswers.title': { 'pt-BR': 'Revisão de Erros', 'en': 'Mistakes Review' },
    'wrongAnswers.description': { 'pt-BR': 'Configure sua prova de revisão focada nas suas dificuldades.', 'en': 'Configure your review exam focused on your weak points.' },
    'wrongAnswers.available': { 'pt-BR': 'questões disponíveis com os filtros atuais', 'en': 'questions available with current filters' },
    'wrongAnswers.limit': { 'pt-BR': 'Limite de Questões', 'en': 'Question Limit' },
    'wrongAnswers.all': { 'pt-BR': 'Todas', 'en': 'All' },
    'wrongAnswers.priority': { 'pt-BR': 'Prioridade', 'en': 'Priority' },
    'wrongAnswers.recent': { 'pt-BR': 'Mais Recentes', 'en': 'Most Recent' },
    'wrongAnswers.recentDesc': { 'pt-BR': 'Foco no curto prazo', 'en': 'Focus on short term' },
    'wrongAnswers.frequent': { 'pt-BR': 'Mais Frequentes', 'en': 'Most Frequent' },
    'wrongAnswers.frequentDesc': { 'pt-BR': 'Foco em dificuldades reais', 'en': 'Focus on real difficulties' },
    'wrongAnswers.filterDomain': { 'pt-BR': 'Filtrar por Domínio', 'en': 'Filter by Domain' },
    'wrongAnswers.selectAll': { 'pt-BR': 'Selecionar Todos', 'en': 'Select All' },
    'wrongAnswers.startReview': { 'pt-BR': 'Começar Revisão', 'en': 'Start Review' },

    // Theme
    'theme.light': { 'pt-BR': 'Modo Claro', 'en': 'Light Mode' },
    'theme.dark': { 'pt-BR': 'Modo Escuro', 'en': 'Dark Mode' },

    // Language
    'language.ptBR': { 'pt-BR': 'Português', 'en': 'Portuguese' },
    'language.en': { 'pt-BR': 'Inglês', 'en': 'English' },
} as const;

export type TranslationKey = keyof typeof translations;

/**
 * Get a translated string for the current language
 */
export function t(key: TranslationKey, lang: Language): string {
    const translation = translations[key];
    if (!translation) {
        console.warn(`Missing translation key: ${key}`);
        return key;
    }
    return translation[lang] || translation['en'] || key;
}

/**
 * Hook to get translation function bound to current language
 */
export function useTranslation() {
    const language = useSettingsStore((state) => state.language);

    return {
        t: (key: TranslationKey) => t(key, language),
        language,
    };
}
