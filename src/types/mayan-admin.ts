export interface BatchRecord {
    id: number;
    // ... other fields if needed
}

export interface RawAnswerItem {
    answer: Record<string, number>[];
}

export type AnswerLabel = "SA" | "A" | "D" | "SD";

export interface Tally {
    SA: number;
    A: number;
    D: number;
    SD: number;
}

export interface Question {
    id: number;
    is_flipped: boolean
}

export interface ResultItem {
    question: Question;
    respondents: number;
    answer: Tally;
}