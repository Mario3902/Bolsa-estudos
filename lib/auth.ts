import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here-change-in-production"

export interface User {
  id: number
  username: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    // For development, use simple authentication
    if (username === "admin" && password === "admin123") {
      return {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
      }
    }

    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
