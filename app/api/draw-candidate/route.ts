import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoria, quantidade = 1 } = body

    if (!categoria) {
      return NextResponse.json({ success: false, error: "Categoria é obrigatória" }, { status: 400 })
    }

    // Get eligible candidates (approved applications)
    let query = `
      SELECT a.*, 
             COALESCE(s.id, 0) as has_scholarship
      FROM applications a
      LEFT JOIN scholarships s ON a.id = s.application_id AND s.status = 'ativo'
      WHERE a.status = 'aprovado'
    `
    const params: any[] = []

    // if (categoria !== "todas") {
    //   query += " AND a.categoria = ?"
    //   params.push(categoria)
    // }

    // Exclude those who already have active scholarships
    query += " AND s.id IS NULL"
    query += " ORDER BY RAND()"
    query += " LIMIT ?"
    params.push(Number.parseInt(quantidade.toString()))

    const candidates = await executeQuery(query, params)

    if ((candidates as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum candidato elegível encontrado para esta categoria",
        },
        { status: 404 },
      )
    }

    // Create scholarships for selected candidates
    const selectedCandidates = []
    for (const candidate of candidates as any[]) {
      try {
        await executeQuery(
          `INSERT INTO scholarships (application_id, amount, duration_months, start_date, end_date, notes)
           VALUES (?, 50000, 12, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 MONTH), ?)`,
          [candidate.id, `Selecionado por sorteio em ${new Date().toLocaleDateString("pt-BR")}`],
        )
        selectedCandidates.push(candidate)
      } catch (scholarshipError) {
        console.error("Error creating scholarship for candidate:", candidate.id, scholarshipError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${selectedCandidates.length} candidato(s) selecionado(s) com sucesso`,
      candidates: selectedCandidates,
    })
  } catch (error) {
    console.error("Error in candidate draw:", error)
    return NextResponse.json({ success: false, error: "Erro no sorteio de candidatos" }, { status: 500 })
  }
}
