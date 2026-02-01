// ============================================================================
// AWS CCP-02 Exam Simulator - Core Types
// ============================================================================

// Domain identifiers matching the CCP-02 exam structure
export type DomainId =
    | 'domain1-cloud-concepts'
    | 'domain2-security'
    | 'domain3-technology'
    | 'domain4-billing';

export type DomainKey = 'domain1' | 'domain2' | 'domain3' | 'domain4';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'single-choice' | 'multiple-choice';
export type OptionId = 'A' | 'B' | 'C' | 'D' | 'E';

// ============================================================================
// Question Schema
// ============================================================================

export interface MermaidDiagram {
    type: 'mermaid';
    code: string;
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface QuestionOption {
    id: OptionId;
    text: string;
}

export interface Question {
    id: string;                           // Format: d{domain}-{number} (e.g., "d1-001")
    domain: DomainId;
    subdomain: string;                    // e.g., "iam-policies", "ec2-storage"
    difficulty: Difficulty;
    type: QuestionType;
    question: string;                     // Scenario text (markdown supported)
    diagram?: MermaidDiagram;
    table?: TableData;
    options: QuestionOption[];
    correct: OptionId[];                  // Array for multiple-choice support
    explanation: string;                  // Detailed explanation (markdown)
    references: string[];                 // AWS documentation links
    tags: string[];
    maarek_reference?: string;            // Course section reference
}

// ============================================================================
// Exam Configuration
// ============================================================================

export type ExamMode = 'official' | 'practice' | 'quick' | 'wrong-answers';

export interface DomainDistribution {
    domain1: number;  // 24% - Cloud Concepts (15 questions)
    domain2: number;  // 30% - Security (18 questions)
    domain3: number;  // 34% - Technology (21 questions)
    domain4: number;  // 12% - Billing (6 questions)
}

export interface ExamConfig {
    mode: ExamMode;
    duration: number;                     // Minutes (90 for official)
    totalQuestions: number;               // 60 for official
    distribution: DomainDistribution;
    allowOvertime: boolean;
    showTimer: boolean;
}

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
    mode: 'official',
    duration: 90,
    totalQuestions: 60,
    distribution: {
        domain1: 15,
        domain2: 18,
        domain3: 21,
        domain4: 6,
    },
    allowOvertime: true,
    showTimer: true,
};

export const PRACTICE_EXAM_CONFIG: ExamConfig = {
    ...DEFAULT_EXAM_CONFIG,
    mode: 'practice',
    duration: 0,              // No time limit
    showTimer: false,
};

export const QUICK_30_CONFIG: ExamConfig = {
    ...DEFAULT_EXAM_CONFIG,
    mode: 'quick',
    duration: 30,
    totalQuestions: 20,
    distribution: {
        domain1: 5,
        domain2: 6,
        domain3: 7,
        domain4: 2,
    },
};

// ============================================================================
// Exam State (Current Exam)
// ============================================================================

export type AnswerStatus = 'unanswered' | 'answered' | 'marked';

export interface QuestionAnswer {
    questionId: string;
    selected: OptionId[];
    timeSpent: number;                    // Seconds spent on this question
    isCorrect?: boolean;                  // Set after exam submission
}

export type ExamPhase = 'not-started' | 'in-progress' | 'finished';

export interface ExamState {
    id: string;
    config: ExamConfig;
    questions: Question[];
    currentIndex: number;
    answers: Map<string, QuestionAnswer>;
    markedForReview: Set<string>;
    startTime: number | null;             // Unix timestamp
    endTime: number | null;
    phase: ExamPhase;
    timeRemaining: number;                // Seconds (negative = overtime)
}

// ============================================================================
// Exam Results & History
// ============================================================================

export interface DomainScore {
    correct: number;
    total: number;
    percentage: number;
}

export interface DomainScores {
    domain1: DomainScore;
    domain2: DomainScore;
    domain3: DomainScore;
    domain4: DomainScore;
}

export interface ExamAttempt {
    id: string;
    date: string;                         // ISO date string
    mode: ExamMode;
    score: number;                        // 100-1000 scale
    passed: boolean;                      // >= 700
    duration: number;                     // Actual time taken in seconds
    totalQuestions: number;
    correctAnswers: number;
    answers: Array<{
        questionId: string;
        selected: OptionId[];
        correct: boolean;
        timeSpent: number;
    }>;
    domainScores: DomainScores;
    questionsUsed: string[];              // Question IDs for randomizer
}

// ============================================================================
// Settings & Preferences
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AudioVolumes {
    tick: number;           // 0-100
    click: number;
    warnings: number;
    alarm: number;
    celebration: number;
}

export interface Settings {
    theme: ThemeMode;
    audio: {
        enabled: boolean;
        volumes: AudioVolumes;
    };
    goals: {
        targetScore: number;  // e.g., 800
        deadline?: string;    // ISO date
    };
    schemaVersion: number;  // For safe migrations
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'light',
    audio: {
        enabled: true,
        volumes: {
            tick: 0,
            click: 30,
            warnings: 80,
            alarm: 100,
            celebration: 70,
        },
    },
    goals: {
        targetScore: 800,
    },
    schemaVersion: 1,
};

// ============================================================================
// Domain Metadata
// ============================================================================

export const DOMAIN_INFO: Record<DomainKey, {
    id: DomainId;
    name: string;
    shortName: string;
    weight: number;
    color: string;
}> = {
    domain1: {
        id: 'domain1-cloud-concepts',
        name: 'Cloud Concepts',
        shortName: 'Cloud',
        weight: 0.24,
        color: 'domain-1',
    },
    domain2: {
        id: 'domain2-security',
        name: 'Security and Compliance',
        shortName: 'Security',
        weight: 0.30,
        color: 'domain-2',
    },
    domain3: {
        id: 'domain3-technology',
        name: 'Cloud Technology and Services',
        shortName: 'Technology',
        weight: 0.34,
        color: 'domain-3',
    },
    domain4: {
        id: 'domain4-billing',
        name: 'Billing, Pricing, and Support',
        shortName: 'Billing',
        weight: 0.12,
        color: 'domain-4',
    },
};

// ============================================================================
// Utility Types
// ============================================================================

export type StorageKey =
    | 'ccp-exam-history'
    | 'ccp-current-exam'
    | 'ccp-settings'
    | 'ccp-stats';
