import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    // Get total applications
    const totalResult = await executeQuery("SELECT COUNT(*) as count FROM applications")
    const total = Array.isArray(totalResult) ? totalResult[0]?.count || 0 : 0

    // Get applications by status
    const statusResult = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `)

    const statusCounts = {
      pendentes: 0,
      aprovadas: 0,
      rejeitadas: 0,
    }

    if (Array.isArray(statusResult)) {
      statusResult.forEach((row: any) => {
        if (row.status === "pendente") statusCounts.pendentes = row.count
        if (row.status === "aprovada") statusCounts.aprovadas = row.count
        if (row.status === "rejeitada") statusCounts.rejeitadas = row.count
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        total,
        ...statusCounts,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar estatísticas",
        stats: {
          total: 0,
          pendentes: 0,
          aprovadas: 0,
          rejeitadas: 0,
        },
      },
      { status: 500 },
    )
  }
}
