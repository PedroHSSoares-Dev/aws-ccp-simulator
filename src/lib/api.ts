// ============================================================================
// API Client - HTTP client for backend communication
// ============================================================================

const API_BASE = 'http://localhost:3001/api';

// Helper to check if API is available
let apiAvailable: boolean | null = null;

async function checkApiHealth(): Promise<boolean> {
    if (apiAvailable !== null) return apiAvailable;

    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });
        apiAvailable = response.ok;
    } catch {
        apiAvailable = false;
    }

    return apiAvailable;
}

// Reset API availability check (call when user wants to retry)
export function resetApiCheck(): void {
    apiAvailable = null;
}

// ============================================================================
// History API
// ============================================================================

export interface AttemptData {
    id: string;
    date: string;
    mode: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    answers: Record<string, string[]>;
    domainScores: Record<string, { correct: number; total: number }>;
}

export async function fetchHistory(): Promise<AttemptData[]> {
    if (!(await checkApiHealth())) {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.warn('API fetch history failed:', error);
        return [];
    }
}

export async function saveAttempt(attempt: AttemptData): Promise<void> {
    if (!(await checkApiHealth())) {
        console.warn('API not available, skipping remote save');
        return;
    }

    try {
        await fetch(`${API_BASE}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attempt),
        });
    } catch (error) {
        console.warn('API save attempt failed:', error);
    }
}

export async function clearHistory(): Promise<void> {
    if (!(await checkApiHealth())) {
        return;
    }

    try {
        await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    } catch (error) {
        console.warn('API clear history failed:', error);
    }
}

// ============================================================================
// Settings API
// ============================================================================

export interface SettingsData {
    theme: string;
    language: string;
    audioEnabled: boolean;
    audioVolumes: Record<string, number>;
    targetScore: number;
    deadline: string | null;
}

export async function fetchSettings(): Promise<SettingsData | null> {
    if (!(await checkApiHealth())) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
        console.warn('API fetch settings failed:', error);
        return null;
    }
}

export async function saveSettings(settings: Partial<SettingsData>): Promise<void> {
    if (!(await checkApiHealth())) {
        return;
    }

    try {
        await fetch(`${API_BASE}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
    } catch (error) {
        console.warn('API save settings failed:', error);
    }
}

// ============================================================================
// Wrong Answers API
// ============================================================================

export interface WrongAnswerData {
    questionId: string;
    domain: string;
    subdomain: string;
    count: number;
    lastWrongAt: string;
}

export async function fetchWrongAnswers(): Promise<WrongAnswerData[]> {
    if (!(await checkApiHealth())) {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/wrong-answers`);
        if (!response.ok) throw new Error('Failed to fetch wrong answers');
        return await response.json();
    } catch (error) {
        console.warn('API fetch wrong answers failed:', error);
        return [];
    }
}

export async function trackWrongAnswer(questionId: string, domain: string, subdomain: string): Promise<void> {
    if (!(await checkApiHealth())) {
        return;
    }

    try {
        await fetch(`${API_BASE}/wrong-answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, domain, subdomain }),
        });
    } catch (error) {
        console.warn('API track wrong answer failed:', error);
    }
}

// ============================================================================
// API Status
// ============================================================================

export async function isApiAvailable(): Promise<boolean> {
    return checkApiHealth();
}
