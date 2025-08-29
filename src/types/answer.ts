export interface AnswerModel {
    [key: string]: number
}

export interface DomainStats {
    sum: number;
    count: number;
}

export interface RawAnswer {
    answer: SingleRawAnswer[]
}

export interface SingleRawAnswer {
    [key: string]: number
}


export type NewAnswerModel = {
    answer: SingleRawAnswer[]
    employee_id: string
    id: string
}


export type CompanyAnswerModel = {
    answer: SingleRawAnswer[],
    employee_id: string
}
