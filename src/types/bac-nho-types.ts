// Shared types for Soi Cầu Bạc Nhớ feature

// Base pattern interface
export interface BaseBacNhoPattern {
    totalTriggerAppearances: number;
    recentHits: {
        triggerDate: string;
        hitDate: string;
        hitNumbers: string[];
    }[];
    daysSinceLastHit: number | null;
    lastHitDate: string | null;
}

// Số Đơn Pattern
export interface BacNhoSoDonPattern extends BaseBacNhoPattern {
    triggerNumber: string; // Số A
    followNumbers: {
        number: string; // Số B
        hitCount: number;
        correlationRate: number;
    }[];
}

// Cặp 2 Pattern
export interface BacNhoCap2Pattern extends BaseBacNhoPattern {
    triggerPair: [string, string]; // Cặp A+B
    followNumbers: {
        number: string; // Số C
        hitCount: number;
        correlationRate: number;
    }[];
}

// Cặp 3 Pattern
export interface BacNhoCap3Pattern extends BaseBacNhoPattern {
    triggerTriple: [string, string, string]; // Cặp A+B+C
    followNumbers: {
        number: string; // Số D
        hitCount: number;
        correlationRate: number;
    }[];
}

// Response data structures
export interface BacNhoSoDonData {
    overview: {
        analyzedDays: number;
        totalPatterns: number;
        latestDate: string;
        dataRange: {
            from: string;
            to: string;
        };
    };
    patterns: BacNhoSoDonPattern[];
    todayPredictions: {
        yesterdayNumber: string;
        predictions: {
            number: string;
            correlationRate: number;
            hitCount: number;
            totalAppearances: number;
        }[];
    }[];
}

export interface BacNhoCap2Data {
    overview: {
        analyzedDays: number;
        totalPatterns: number;
        latestDate: string;
        dataRange: {
            from: string;
            to: string;
        };
    };
    patterns: BacNhoCap2Pattern[];
    todayPredictions: {
        yesterdayPair: [string, string];
        predictions: {
            number: string;
            correlationRate: number;
            hitCount: number;
            totalAppearances: number;
        }[];
    }[];
}

export interface BacNhoCap3Data {
    overview: {
        analyzedDays: number;
        totalPatterns: number;
        latestDate: string;
        dataRange: {
            from: string;
            to: string;
        };
    };
    patterns: BacNhoCap3Pattern[];
    todayPredictions: {
        yesterdayTriple: [string, string, string];
        predictions: {
            number: string;
            correlationRate: number;
            hitCount: number;
            totalAppearances: number;
        }[];
    }[];
}

// ===== Bạc Nhớ 2 Ngày Types =====
export interface BacNho2NgayPattern {
    triggerPair: [string, string]; // [A from D-1, B from D]
    totalAppearances: number;
    followNumbers: {
        number: string;
        hitCount: number;
        correlationRate: number;
    }[];
    recentHits: {
        dayDMinus1: string;
        dayD: string;
        dayDPlus1: string;
        hitNumbers: string[];
    }[];
    daysSinceLastHit: number | null;
    lastHitDate: string | null;
}

export interface BacNho2NgayTodayPrediction {
    yesterdayPair: [string, string]; // Pair from (D-1, D)
    predictions: {
        number: string;
        correlationRate: number;
        hitCount: number;
        totalAppearances: number;
    }[];
}

export interface BacNho2NgayData {
    overview: {
        analyzedDays: number;
        totalPatterns: number;
        latestDate: string;
        dataRange: {
            from: string;
            to: string;
        };
    };
    patterns: BacNho2NgayPattern[];
    todayPredictions: BacNho2NgayTodayPrediction[];
}
