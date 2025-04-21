export interface UserModel {
    email: string
    first_name: string
    last_name: string
    department_name: string
    company: string
    password: string
}

export interface UserQuery {
    company: string,
    email: string
}

export interface LoginCreds {
    email: string
    password: string
}