import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let query = "SELECT * FROM applications WHERE 1=1"
    const params: any[] = []

    if (search) {
      query += " AND (nome LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status && status !== "todos") {
      query += " AND status = ?"
      params.push(status)
    }

    query += " ORDER BY created_at DESC"

    const applications = await executeQuery(query, params)

    return NextResponse.json({
      success: true,
      applications: Array.isArray(applications) ? applications : [],
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar candidaturas",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received application data:", body)

    // Validate required fields
    const requiredFields = [
      "nome",
      "email",
      "telefone",
      "data_nascimento",
      "genero",
      "provincia",
      "municipio",
      "endereco",
      "nivel_escolaridade",
      "instituicao_ensino",
      "curso",
      "ano_conclusao",
      "media",
      "carta_motivacao",
      "objetivos_carreira",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Campo obrigatório: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato de email inválido",
        },
        { status: 400 },
      )
    }

    // Validate media (grade average)
    const media = Number.parseFloat(body.media)
    if (isNaN(media) || media < 10 || media > 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Média deve estar entre 10 e 20 valores",
        },
        { status: 400 },
      )
    }

    // Check for duplicate email
    const existingApplication = await executeQuery("SELECT id FROM applications WHERE email = ?", [body.email])

    if (Array.isArray(existingApplication) && existingApplication.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe uma candidatura com este email",
        },
        { status: 409 },
      )
    }

    // Insert application
    const insertQuery = `
      INSERT INTO applications (
        nome, email, telefone, data_nascimento, genero, provincia, municipio, endereco,
        nivel_escolaridade, instituicao_ensino, curso, ano_conclusao, media,
        carta_motivacao, objetivos_carreira, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW())
    `

    const insertParams = [
      body.nome,
      body.email,
      body.telefone,
      body.data_nascimento,
      body.genero,
      body.provincia,
      body.municipio,
      body.endereco,
      body.nivel_escolaridade,
      body.instituicao_ensino,
      body.curso,
      body.ano_conclusao,
      media,
      body.carta_motivacao,
      body.objetivos_carreira,
    ]

    const result = await executeQuery(insertQuery, insertParams)

    console.log("Application inserted successfully:", result)

    return NextResponse.json({
      success: true,
      message: "Candidatura submetida com sucesso!",
      applicationId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
