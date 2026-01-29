export interface LotoStat {
    number: string;
    appearances: number;
    lastDate: string;
    daysSinceLastAppearance: number;
    averageCycle: number;
    maxGan: number;
    isDue: boolean;
    hitDates: string[];
}

export interface Loto34CangData {
    loto3Cang: {
        top10: LotoStat[];
        due: LotoStat[];
    };
    loto4Cang: {
        top10: LotoStat[];
        due: LotoStat[];
    };
    overview: {
        totalDays: number;
        fromDate: string;
        toDate: string;
    };
}
