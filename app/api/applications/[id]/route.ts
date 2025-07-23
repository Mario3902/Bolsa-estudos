import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const applicationId = params.id

    if (!status || !["pendente", "aprovada", "rejeitada"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Status inválido",
        },
        { status: 400 },
      )
    }

    await executeQuery("UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?", [status, applicationId])

    return NextResponse.json({
      success: true,
      message: "Status atualizado com sucesso",
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id

    const applications = await executeQuery("SELECT * FROM applications WHERE id = ?", [applicationId])

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidatura não encontrada",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      application: applications[0],
    })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
