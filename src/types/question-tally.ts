export type AnswerLabel = "SA" | "A" | "D" | "SD";

export type Tally = {
    [key in AnswerLabel]: number;
};

export type ResultItem = {
    question_id: number;
    answer: { [key in AnswerLabel]: number }[];
};
