// ============================================================================
// Question Loader - Loads all domain questions
// ============================================================================

import type { Question, DomainId, DomainKey, OptionId, Difficulty, QuestionType } from '../types';

// Import all domain question files
import domain1Data from './questions-domain1.json';
import domain2Data from './questions-domain2.json';
import domain3Data from './questions-domain3.json';
import domain4Data from './questions-domain4.json';

// Map domain names from JSON to our internal DomainId format
const domainMapping: Record<string, DomainId> = {
    'domain1-cloud-concepts': 'domain1-cloud-concepts',
    'domain2-security': 'domain2-security',
    'domain3-technology': 'domain3-technology',
    'domain4-billing': 'domain4-billing',
};

// Map DomainKey to DomainId and vice versa
const domainKeyToId: Record<DomainKey, DomainId> = {
    'domain1': 'domain1-cloud-concepts',
    'domain2': 'domain2-security',
    'domain3': 'domain3-technology',
    'domain4': 'domain4-billing',
};

// Map difficulty strings
const difficultyMapping: Record<string, Difficulty> = {
    'easy': 'easy',
    'medium': 'medium',
    'hard': 'hard',
};

/**
 * Transforms a raw question from JSON to our internal Question format
 */
function transformQuestion(raw: any): Question {
    // Map domain - default to domain1-cloud-concepts
    const domain: DomainId = domainMapping[raw.domain] || 'domain1-cloud-concepts';

    // Map options
    const options = (raw.options || []).map((opt: any) => ({
        id: opt.id as OptionId,
        text: opt.text,
    }));

    // Map correct answers
    const correct = (raw.correct || []).map((c: string) => c as OptionId);

    // Determine question type
    const type: QuestionType = raw.type === 'multiple-choice' ? 'multiple-choice' : 'single-choice';

    return {
        id: raw.id,
        domain,
        subdomain: raw.subdomain || '',
        difficulty: difficultyMapping[raw.difficulty] || 'medium',
        type,
        question: raw.question,
        options,
        correct,
        explanation: raw.explanation || '',
        references: raw.references || [],
        tags: raw.tags || [],
        maarek_reference: raw.maarek_reference,
    };
}

/**
 * Load and transform all questions from all domains
 */
export function loadAllQuestions(): Question[] {
    const allRawQuestions = [
        ...domain1Data,
        ...domain2Data,
        ...domain3Data,
        ...domain4Data,
    ];

    return allRawQuestions.map(transformQuestion);
}

/**
 * Load questions for a specific domain by DomainKey
 */
export function loadQuestionsByDomainKey(domainKey: DomainKey): Question[] {
    const dataMap: Record<DomainKey, any[]> = {
        domain1: domain1Data,
        domain2: domain2Data,
        domain3: domain3Data,
        domain4: domain4Data,
    };

    const rawQuestions = dataMap[domainKey] || [];
    return rawQuestions.map(transformQuestion);
}

/**
 * Get question counts by domain key
 */
export function getQuestionCounts(): Record<DomainKey, number> {
    return {
        domain1: domain1Data.length,
        domain2: domain2Data.length,
        domain3: domain3Data.length,
        domain4: domain4Data.length,
    };
}

/**
 * Get total question count
 */
export function getTotalQuestionCount(): number {
    return domain1Data.length + domain2Data.length + domain3Data.length + domain4Data.length;
}

// Export loaded questions as a constant for easy access
export const allQuestions = loadAllQuestions();

// Export utility function
export { domainKeyToId };
