import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (status && status !== "todos") {
      whereClause += " AND s.status = ?"
      params.push(status)
    }

    // Get total count
    const countResult = await executeQuery(
      `
      SELECT COUNT(*) as total 
      FROM scholarships s
      INNER JOIN applications a ON s.application_id = a.id
      ${whereClause}
    `,
      params,
    )
    const total = (countResult as any)[0].total

    // Get scholarships with application details
    const scholarships = await executeQuery(
      `
      SELECT 
        s.*,
        a.nome_completo,
        a.email,
        a.telefone,
        a.categoria,
        a.universidade,
        a.curso
      FROM scholarships s
      INNER JOIN applications a ON s.application_id = a.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    )

    return NextResponse.json({
      success: true,
      scholarships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar bolsas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { application_id, amount, duration_months, start_date, end_date, notes } = body

    if (!application_id || !amount || !duration_months || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 },
      )
    }

    // Check if application exists and is approved
    const applications = await executeQuery("SELECT id, status FROM applications WHERE id = ?", [
      application_id,
    ])

    if ((applications as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Candidatura não encontrada" }, { status: 404 })
    }

    const application = (applications as any[])[0]
    if (application.status !== "aprovado") {
      return NextResponse.json(
        { success: false, error: "Apenas candidaturas aprovadas podem receber bolsas" },
        { status: 400 },
      )
    }

    // Check if already has active scholarship
    const existingScholarships = await executeQuery(
      "SELECT id FROM scholarships WHERE application_id = ? AND status = 'ativo'",
      [application_id],
    )

    if ((existingScholarships as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "Esta candidatura já possui uma bolsa ativa" }, { status: 400 })
    }

    // Create scholarship
    const result = await executeQuery(
      `INSERT INTO scholarships (application_id, amount, duration_months, start_date, end_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [application_id, amount, duration_months, start_date, end_date, notes || ""],
    )

    return NextResponse.json({
      success: true,
      message: "Bolsa criada com sucesso",
      scholarshipId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error creating scholarship:", error)
    return NextResponse.json({ success: false, error: "Erro ao criar bolsa" }, { status: 500 })
  }
}
