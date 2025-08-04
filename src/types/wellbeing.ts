export interface Score {
    career: number;
    character: number;
    contentment: number;
    connectedness: number;
}

export interface WellbeingItem {
    wellbeing_score: Score;
}

export interface OverallWellbeingScore {
    wellbeing_score: Score
}

export interface DomainWellbeing {
    domain: string
    stanine_label: string
    stanine_score: number
    insight: string
    to_do: string
}