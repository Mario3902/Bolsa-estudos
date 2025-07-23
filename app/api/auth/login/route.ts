import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login attempt received")

    const body = await request.json()
    console.log("Request body:", body)

    const { username, password } = body

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Username e password são obrigatórios",
        },
        { status: 400 },
      )
    }

    console.log("Attempting to authenticate user:", username)
    const user = await authenticateUser(username, password)

    if (!user) {
      console.log("Authentication failed for user:", username)
      return NextResponse.json(
        {
          success: false,
          error: "Credenciais inválidas",
        },
        { status: 401 },
      )
    }

    console.log("User authenticated successfully:", user.username)
    const token = generateToken(user)

    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    console.log("Login successful, token set")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
