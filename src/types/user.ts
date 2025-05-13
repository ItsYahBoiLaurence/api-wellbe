export interface UserModel {
    email: string
    firstname: string
    lastname: string
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