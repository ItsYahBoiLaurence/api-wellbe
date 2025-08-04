export interface BatchRecord {
    id: number;
    // ... other fields if needed
}

export interface RawAnswerItem {
    answer: Record<string, number>[]; // e.g., [{ "1": 4 }, { "2": 3 }]
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
    // Assuming questions have a 'text' property
    // ... other fields
}

export interface ResultItem {
    question: Question;
    respondents: number;
    answer: Tally; // Or Record<AnswerLabel, number> if you prefer
}