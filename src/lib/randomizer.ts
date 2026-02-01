// ============================================================================
// Question Randomizer
// Smart question selection with domain distribution and history awareness
// ============================================================================

import type {
    Question,
    DomainDistribution,
    DomainId,
    DomainKey
} from '../types';

/**
 * Fisher-Yates shuffle algorithm for unbiased randomization
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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
 * Groups questions by domain
 */
export function groupByDomain(questions: Question[]): Record<DomainKey, Question[]> {
    const grouped: Record<DomainKey, Question[]> = {
        domain1: [],
        domain2: [],
        domain3: [],
        domain4: [],
    };

    questions.forEach(question => {
        const domainKey = getDomainKey(question.domain);
        if (domainKey && grouped[domainKey]) {
            grouped[domainKey].push(question);
        } else {
            console.warn(`[Randomizer] Invalid domain for question ${question.id}: ${question.domain}`);
        }
    });

    return grouped;
}

/**
 * Selects questions for an exam with proper domain distribution
 * 
 * @param allQuestions - Pool of all available questions
 * @param distribution - Target number of questions per domain
 * @param recentQuestionIds - Question IDs to avoid (from recent exams)
 * @returns Selected questions array
 */
export function selectExamQuestions(
    allQuestions: Question[],
    distribution: DomainDistribution,
    recentQuestionIds: string[] = []
): Question[] {
    const recentSet = new Set(recentQuestionIds);
    const grouped = groupByDomain(allQuestions);
    const selected: Question[] = [];

    // For each domain, select the required number of questions
    (Object.entries(distribution) as [DomainKey, number][]).forEach(([domainKey, count]) => {
        const domainQuestions = grouped[domainKey];

        // Separate fresh and recently used questions
        const freshQuestions = domainQuestions.filter(q => !recentSet.has(q.id));
        const usedQuestions = domainQuestions.filter(q => recentSet.has(q.id));

        // Shuffle both pools
        const shuffledFresh = shuffle(freshQuestions);
        const shuffledUsed = shuffle(usedQuestions);

        // Prioritize fresh questions, but fall back to used if needed
        const available = [...shuffledFresh, ...shuffledUsed];

        // Select the required count
        const domainSelected = available.slice(0, count);
        selected.push(...domainSelected);

        // Warn if we couldn't get enough questions
        if (domainSelected.length < count) {
            console.warn(
                `Domain ${domainKey}: Only ${domainSelected.length}/${count} questions available`
            );
        }
    });

    // Final shuffle to mix domains
    return shuffle(selected);
}

/**
 * Selects questions for wrong-answers mode
 * Only includes questions that were answered incorrectly
 */
export function selectWrongAnswersQuestions(
    allQuestions: Question[],
    wrongQuestionIds: string[],
    maxQuestions: number = 60
): Question[] {
    const wrongSet = new Set(wrongQuestionIds);
    const wrongQuestions = allQuestions.filter(q => wrongSet.has(q.id));

    // Shuffle and limit
    const shuffled = shuffle(wrongQuestions);
    return shuffled.slice(0, maxQuestions);
}

/**
 * Selects questions focused on weak domains
 * Increases representation of domains with lower scores
 */
export function selectWeakDomainQuestions(
    allQuestions: Question[],
    weakDomains: DomainKey[],
    totalQuestions: number = 60
): Question[] {
    const grouped = groupByDomain(allQuestions);
    const selected: Question[] = [];

    if (weakDomains.length === 0) {
        // No weak domains, use standard distribution
        return selectExamQuestions(allQuestions, {
            domain1: 15,
            domain2: 18,
            domain3: 21,
            domain4: 6,
        });
    }

    // Calculate adjusted distribution (boost weak domains)
    const basePerDomain = Math.floor(totalQuestions / 4);
    const weakBoost = Math.floor(totalQuestions * 0.1 / weakDomains.length);

    const adjustedDistribution: DomainDistribution = {
        domain1: basePerDomain,
        domain2: basePerDomain,
        domain3: basePerDomain,
        domain4: basePerDomain,
    };

    // Boost weak domains
    weakDomains.forEach(domain => {
        adjustedDistribution[domain] += weakBoost;
    });

    // Normalize to total questions
    const total = Object.values(adjustedDistribution).reduce((a, b) => a + b, 0);
    const scale = totalQuestions / total;

    (Object.keys(adjustedDistribution) as DomainKey[]).forEach(domain => {
        adjustedDistribution[domain] = Math.round(adjustedDistribution[domain] * scale);
    });

    return selectExamQuestions(allQuestions, adjustedDistribution);
}

/**
 * Creates a quick exam with fewer questions
 */
export function selectQuickExamQuestions(
    allQuestions: Question[],
    totalQuestions: number = 20,
    recentQuestionIds: string[] = []
): Question[] {
    // Proportional distribution for fewer questions
    const distribution: DomainDistribution = {
        domain1: Math.round(totalQuestions * 0.24),
        domain2: Math.round(totalQuestions * 0.30),
        domain3: Math.round(totalQuestions * 0.34),
        domain4: Math.round(totalQuestions * 0.12),
    };

    return selectExamQuestions(allQuestions, distribution, recentQuestionIds);
}
