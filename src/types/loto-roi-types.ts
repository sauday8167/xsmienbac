export interface LotoRoiAnalysisRequest {
    date?: string; // If not provided, use the latest available date
}

export interface TypeAAnalysis {
    pair: [string, string]; // [Dt-1, Reverse(Dt-1)]
    status: 'Ổn định' | 'Cầu mới' | 'Đang khan' | 'Cầu đang vào nhịp' | 'Gãy cầu';
    suggestion: 'Đánh trong ngày' | 'Nuôi khung 3 ngày' | 'Tạm dừng';
    historyCheck: {
        matches3Days: boolean; // True if appeared in Lotto in the last 3 days
        lastAppearance?: string; // Date string
    };
    source: string; // The special prize number it came from
}

export interface TypeBAnalysis {
    intersection: {
        numbers: string[];
        description: string;
    };
    multiHit: {
        numbers: string[];
        description: string;
    };
}

export interface RiskAnalysis {
    ganList: {
        number: string;
        daysParams: number; // Days since last appearance
        isRisky: boolean; // > 15 days
    }[];
    cycleWarning: {
        isBroken: boolean; // True if Type A hasn't appeared in last 4 days
        message: string;
    };
}

export interface FinancialPlan {
    investmentRatio: [number, number, number]; // 1:2:4
    days: {
        day: number;
        points: number;
        capital: number;
        revenue: number;
        profit: number;
    }[];
}

export interface LotoRoiHistoryEntry {
    date: string;
    actualLoto: string[];
    predictedDe: string[]; // From Type A
    predictedLoto: string[]; // From Type B
    isHitDe: boolean;
    isHitLoto: boolean;
    hitNumbers: string[];
}

export interface LotoRoiResponse {
    date: string;
    typeA: TypeAAnalysis;
    typeB: TypeBAnalysis;
    risks: RiskAnalysis;
    financialPlan: FinancialPlan;
    history: LotoRoiHistoryEntry[];
}
