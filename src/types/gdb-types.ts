export interface GdbHistoryEntry {
    date: string;
    actualDe: string;
    predictedSum: string[];
    predictedEdge: string[];
    isHit: boolean;
    hitType?: 'Sum' | 'Edge' | 'Touch';
}

export interface GdbAnalysisData {
    date: string;
    rawGdb: string;
    sum: {
        value: number;
        pairs: string[];
        message: string;
    };
    edge: {
        digits: [string, string];
        pairs: string[];
        rating: 'Tốt' | 'Thường';
        message: string;
    };
    pivot: {
        digit: string;
        touchSet: string[];
        message: string;
    };
    strategy: {
        method: string;
        advice: string;
    };
    history: GdbHistoryEntry[];
}

export interface GdbAnalysisResponse {
    success: boolean;
    data?: GdbAnalysisData;
    error?: string;
}
