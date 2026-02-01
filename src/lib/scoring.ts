// ============================================================================
// AWS Scoring Algorithm
// Implements the weighted scoring system matching AWS certification scoring
// ============================================================================

import type {
    ExamAttempt,
    Question,
    QuestionAnswer,
    DomainScores,
    DomainScore,
    DomainKey,
    DomainId,
    Difficulty,
} from '../types';

// AWS CCP-02 Domain Weights
const DOMAIN_WEIGHTS: Record<DomainKey, number> = {
    domain1: 0.24,  // Cloud Concepts: 24%
    domain2: 0.30,  // Security: 30%
    domain3: 0.34,  // Technology: 34%
    domain4: 0.12,  // Billing: 12%
};

// Difficulty multipliers for weighted scoring
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.2,
};

// AWS Score range
const MIN_SCORE = 100;
const MAX_SCORE = 1000;
const PASSING_SCORE = 700;

/**
 * Maps domain ID to domain key
 */
function getDomainKey(domainId: DomainId): DomainKey {
    const mapping: Record<DomainId, DomainKey> = {
        'domain1-cloud-concepts': 'domain1',
        'domain2-security': 'domain2',
        'domain3-technology': 'domain3',
        'domain4-billing': 'domain4',
    };
    return mapping[domainId];
}

/**
 * Checks if an answer is correct (handles both single and multiple choice)
 */
export function isAnswerCorrect(
    question: Question,
    answer: QuestionAnswer
): boolean {
    if (question.type === 'single-choice') {
        return answer.selected.length === 1 &&
            answer.selected[0] === question.correct[0];
    }

    // Multiple choice: must have exact same options selected
    if (answer.selected.length !== question.correct.length) {
        return false;
    }

    const sortedSelected = [...answer.selected].sort();
    const sortedCorrect = [...question.correct].sort();

    return sortedSelected.every((opt, i) => opt === sortedCorrect[i]);
}

/**
 * Calculates domain-level scores
 */
export function calculateDomainScores(
    questions: Question[],
    answers: Record<string, QuestionAnswer>
): DomainScores {
    const domainStats: Record<DomainKey, { correct: number; total: number }> = {
        domain1: { correct: 0, total: 0 },
        domain2: { correct: 0, total: 0 },
        domain3: { correct: 0, total: 0 },
        domain4: { correct: 0, total: 0 },
    };

    questions.forEach(question => {
        const domainKey = getDomainKey(question.domain);
        domainStats[domainKey].total += 1;

        const answer = answers[question.id];
        if (answer && isAnswerCorrect(question, answer)) {
            domainStats[domainKey].correct += 1;
        }
    });

    const createDomainScore = (stats: { correct: number; total: number }): DomainScore => ({
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0
            ? Math.round((stats.correct / stats.total) * 100)
            : 0,
    });

    return {
        domain1: createDomainScore(domainStats.domain1),
        domain2: createDomainScore(domainStats.domain2),
        domain3: createDomainScore(domainStats.domain3),
        domain4: createDomainScore(domainStats.domain4),
    };
}

/**
 * Calculates the weighted AWS score (100-1000 scale)
 * 
 * The scoring algorithm:
 * 1. Calculate raw percentage per domain (correct/total)
 * 2. Apply domain weights (24%, 30%, 34%, 12%)
 * 3. Apply difficulty multipliers for fine-tuning
 * 4. Normalize to 100-1000 scale
 */
export function calculateAWSScore(
    questions: Question[],
    answers: Record<string, QuestionAnswer>
): number {
    if (questions.length === 0) return MIN_SCORE;

    // Calculate difficulty-weighted correctness
    let weightedCorrect = 0;
    let weightedTotal = 0;

    questions.forEach(question => {
        const domainKey = getDomainKey(question.domain);
        const domainWeight = DOMAIN_WEIGHTS[domainKey];
        const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[question.difficulty];

        const questionWeight = domainWeight * difficultyMultiplier;
        weightedTotal += questionWeight;

        const answer = answers[question.id];
        if (answer && isAnswerCorrect(question, answer)) {
            weightedCorrect += questionWeight;
        }
    });

    // Calculate raw percentage
    const rawPercentage = weightedTotal > 0 ? weightedCorrect / weightedTotal : 0;

    // Normalize to AWS scale (100-1000)
    // AWS uses a non-linear scaling, but we approximate with:
    // - Score = MIN_SCORE + (percentage * (MAX_SCORE - MIN_SCORE))
    // - With a slight curve to make passing at 70% map to ~700
    const score = MIN_SCORE + Math.round(rawPercentage * (MAX_SCORE - MIN_SCORE));

    return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

/**
 * Determines if the score is passing (>= 700)
 */
export function isPassing(score: number): boolean {
    return score >= PASSING_SCORE;
}

/**
 * Creates a complete ExamAttempt record from exam data
 */
export function createExamAttempt(
    examId: string,
    mode: 'official' | 'practice' | 'quick' | 'wrong-answers',
    questions: Question[],
    answers: Record<string, QuestionAnswer>,
    startTime: number,
    endTime: number
): ExamAttempt {
    const score = calculateAWSScore(questions, answers);
    const domainScores = calculateDomainScores(questions, answers);

    let correctCount = 0;
    const answerRecords = questions.map(question => {
        const answer = answers[question.id];
        const correct = answer ? isAnswerCorrect(question, answer) : false;
        if (correct) correctCount += 1;

        return {
            questionId: question.id,
            selected: answer?.selected ?? [],
            correct,
            timeSpent: answer?.timeSpent ?? 0,
        };
    });

    return {
        id: examId,
        date: new Date().toISOString(),
        mode,
        score,
        passed: isPassing(score),
        duration: Math.round((endTime - startTime) / 1000),
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        answers: answerRecords,
        domainScores,
        questionsUsed: questions.map(q => q.id),
    };
}

/**
 * Gets a descriptive label for a score range
 */
export function getScoreLabel(score: number): string {
    if (score >= 900) return 'Exceptional';
    if (score >= 800) return 'Excellent';
    if (score >= 700) return 'Passed';
    if (score >= 600) return 'Close';
    if (score >= 500) return 'Needs Improvement';
    return 'Keep Studying';
}

/**
 * Calculates how many more questions would be needed to pass
 */
export function questionsToPass(
    currentCorrect: number,
    totalQuestions: number
): number {
    const passingPercentage = 0.70; // Approximately 70% to get 700
    const requiredCorrect = Math.ceil(totalQuestions * passingPercentage);
    return Math.max(0, requiredCorrect - currentCorrect);
}
