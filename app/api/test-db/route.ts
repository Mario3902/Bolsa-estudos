import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/database"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to database",
        },
        { status: 500 },
      )
    }

    // Test table existence
    const tables = await executeQuery("SHOW TABLES")
    console.log("Available tables:", tables)

    // Test applications table
    const applicationsCount = await executeQuery("SELECT COUNT(*) as count FROM applications")
    const totalApplications = Array.isArray(applicationsCount) ? applicationsCount[0]?.count || 0 : 0

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      details: {
        connected: true,
        tables: Array.isArray(tables) ? tables.length : 0,
        totalApplications,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
