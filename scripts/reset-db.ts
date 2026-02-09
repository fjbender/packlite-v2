/**
 * Database reset script
 * Drops all collections and reinitializes the database
 */

import { MongoClient } from 'mongodb'
import initializeDatabase from './init-db'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/packlite'
const DB_NAME = 'packlite'

async function resetDatabase() {
  console.log('🔄 Resetting Packlite database...\n')

  const client = new MongoClient(DATABASE_URL)

  try {
    await client.connect()
    console.log('✓ Connected to MongoDB\n')

    const db = client.db(DB_NAME)

    // Get all collections
    const collections = await db.listCollections().toArray()

    if (collections.length === 0) {
      console.log('• Database is already empty\n')
    } else {
      console.log('🗑️  Dropping all collections...')
      for (const collection of collections) {
        await db.collection(collection.name).drop()
        console.log(`  ✓ Dropped ${collection.name}`)
      }
      console.log('')
    }

    await client.close()

    // Reinitialize
    await initializeDatabase()

    console.log('✅ Database reset completed!\n')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default resetDatabase
