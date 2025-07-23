import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware running for:", pathname)

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("auth-token")?.value

    console.log("Checking auth token:", !!token)

    if (!token) {
      console.log("No token found, redirecting to login")
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Invalid token, redirecting to login")
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    console.log("Token valid, allowing access")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
