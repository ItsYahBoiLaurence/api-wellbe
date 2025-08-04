export interface User {
    email: string
    first_name: string
    last_name: string
    department_name: string
    company: string
}

export interface UserModel extends User {
    password: string
}

export interface UserWithRole extends UserModel {
    role?: string
}

export interface UserQuery {
    company: string,
    email: string
}

export interface LoginCreds {
    email: string
    password: string
}