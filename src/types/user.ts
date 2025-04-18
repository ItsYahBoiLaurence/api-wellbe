export interface UserModel {
    email: string
    first_name: string
    last_name: string
    department_name: string
    company: string
}

export interface UserQuery {
    company: string,
    email: string
}