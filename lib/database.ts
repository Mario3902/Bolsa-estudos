import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "sql10.freesqldatabase.com",
  user: process.env.DB_USER || "sql10791432",
  password: process.env.DB_PASSWORD || "9VKP6mHuiJ",
  database: process.env.DB_NAME || "sql10791432",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
}

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const connection = getPool()

  try {
    console.log("Executing query:", query)
    console.log("With params:", params)

    const [results] = await connection.execute(query, params)
    console.log("Query results:", results)

    return results
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw error
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = getPool()
    await connection.execute("SELECT 1")
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
