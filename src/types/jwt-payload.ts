export interface JwtPayload {
    sub: string;
    company: string;
    role: string;
    iat: number;
    exp: number;
}