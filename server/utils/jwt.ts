import jwt from 'jsonwebtoken'

export interface JwtPayload {
    userId: number
    email: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload
}

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload
}
