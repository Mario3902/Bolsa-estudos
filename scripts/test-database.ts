import { getConnection, testConnection } from "../lib/database"

async function runDatabaseTest() {
  console.log("🔄 Testing database connection...")

  try {
    // Test basic connection
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error("❌ Database connection failed")
      return
    }

    console.log("✅ Database connection successful")

    const connection = getConnection()

    // Test table creation
    console.log("🔄 Checking tables...")
    const [tables] = await connection.execute("SHOW TABLES")
    console.log("📋 Available tables:", tables)

    // Test applications table
    try {
      const [applications] = await connection.execute("SELECT COUNT(*) as count FROM applications")
      const count = (applications as any)[0].count
      console.log(`📊 Applications table: ${count} records`)

      // Test sample query
      const [sampleApps] = await connection.execute("SELECT id, nome_completo, email, status FROM applications LIMIT 3")
      console.log("📝 Sample applications:", sampleApps)
    } catch (error) {
      console.error("❌ Error accessing applications table:", error)
    }

    // Test documents table
    try {
      const [documents] = await connection.execute("SELECT COUNT(*) as count FROM documents")
      const docCount = (documents as any)[0].count
      console.log(`📄 Documents table: ${docCount} records`)
    } catch (error) {
      console.error("❌ Error accessing documents table:", error)
    }

    console.log("✅ Database test completed successfully")
  } catch (error) {
    console.error("❌ Database test failed:", error)
  }
}

// Run the test
runDatabaseTest()
