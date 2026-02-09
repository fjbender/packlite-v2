/**
 * Database initialization script
 * Sets up collections and indexes for the Packlite application
 */

import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/packlite'
const DB_NAME = 'packlite'

async function initializeDatabase() {
  console.log('🔧 Initializing Packlite database...\n')

  const client = new MongoClient(DATABASE_URL)

  try {
    await client.connect()
    console.log('✓ Connected to MongoDB\n')

    const db = client.db(DB_NAME)

    // Get existing collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    console.log('📋 Setting up collections and indexes...\n')

    // ============================================
    // Users Collection
    // ============================================
    if (!collectionNames.includes('users')) {
      await db.createCollection('users')
      console.log('✓ Created users collection')
    } else {
      console.log('• Users collection already exists')
    }

    // Indexes for users
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    console.log('  ✓ Created unique index on email')

    await db.collection('users').createIndex({ createdAt: -1 })
    console.log('  ✓ Created index on createdAt\n')

    // ============================================
    // Gear Items Collection
    // ============================================
    if (!collectionNames.includes('gear')) {
      await db.createCollection('gear')
      console.log('✓ Created gear collection')
    } else {
      console.log('• Gear collection already exists')
    }

    // Indexes for gear
    await db.collection('gear').createIndex({ userId: 1 })
    console.log('  ✓ Created index on userId')

    await db.collection('gear').createIndex({ userId: 1, category: 1 })
    console.log('  ✓ Created compound index on userId + category')

    await db.collection('gear').createIndex({ createdAt: -1 })
    console.log('  ✓ Created index on createdAt\n')

    // ============================================
    // Food Items Collection (Pantry)
    // ============================================
    if (!collectionNames.includes('food')) {
      await db.createCollection('food')
      console.log('✓ Created food collection')
    } else {
      console.log('• Food collection already exists')
    }

    // Indexes for food
    await db.collection('food').createIndex({ userId: 1 })
    console.log('  ✓ Created index on userId')

    await db.collection('food').createIndex({ userId: 1, mealType: 1 })
    console.log('  ✓ Created compound index on userId + mealType')

    await db.collection('food').createIndex({ expirationDate: 1 })
    console.log('  ✓ Created index on expirationDate')

    await db.collection('food').createIndex({ createdAt: -1 })
    console.log('  ✓ Created index on createdAt\n')

    // ============================================
    // Trips Collection
    // ============================================
    if (!collectionNames.includes('trips')) {
      await db.createCollection('trips')
      console.log('✓ Created trips collection')
    } else {
      console.log('• Trips collection already exists')
    }

    // Indexes for trips
    await db.collection('trips').createIndex({ userId: 1 })
    console.log('  ✓ Created index on userId')

    await db.collection('trips').createIndex({ userId: 1, isArchived: 1 })
    console.log('  ✓ Created compound index on userId + isArchived')

    await db.collection('trips').createIndex({ startDate: -1 })
    console.log('  ✓ Created index on startDate')

    await db.collection('trips').createIndex({ shareLink: 1 }, { sparse: true })
    console.log('  ✓ Created sparse index on shareLink')

    await db.collection('trips').createIndex({ isPublic: 1, createdAt: -1 })
    console.log('  ✓ Created compound index on isPublic + createdAt')

    await db.collection('trips').createIndex({ createdAt: -1 })
    console.log('  ✓ Created index on createdAt\n')

    // ============================================
    // Sessions Collection (NextAuth)
    // ============================================
    if (!collectionNames.includes('sessions')) {
      await db.createCollection('sessions')
      console.log('✓ Created sessions collection')
    } else {
      console.log('• Sessions collection already exists')
    }

    // Indexes for sessions
    await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true })
    console.log('  ✓ Created unique index on sessionToken')

    await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
    console.log('  ✓ Created TTL index on expires\n')

    // ============================================
    // Database Stats
    // ============================================
    const stats = await db.stats()
    console.log('📊 Database Statistics:')
    console.log(`  • Database: ${stats.db}`)
    console.log(`  • Collections: ${stats.collections}`)
    console.log(`  • Indexes: ${stats.indexes}`)
    console.log(`  • Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`)
    console.log(`  • Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`)

    console.log('✅ Database initialization completed successfully!\n')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✓ Disconnected from MongoDB\n')
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default initializeDatabase
