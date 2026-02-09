/**
 * Database seed script for development
 * Creates sample data for testing
 */

import { MongoClient } from 'mongodb'
import { hash } from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/packlite'
const DB_NAME = 'packlite'

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...\n')

  const client = new MongoClient(DATABASE_URL)

  try {
    await client.connect()
    console.log('✓ Connected to MongoDB\n')

    const db = client.db(DB_NAME)

    // Check if data already exists
    const userCount = await db.collection('users').countDocuments()
    if (userCount > 0) {
      console.log('⚠️  Database already contains data.')
      console.log('Run "npm run db:reset" first to clear data, or')
      console.log('manually delete collections before seeding.\n')
      return
    }

    // Create demo user
    console.log('👤 Creating demo user...')
    const hashedPassword = await hash('Demo1234!', 12)
    const demoUser = await db.collection('users').insertOne({
      email: 'demo@packlite.com',
      name: 'Demo User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`✓ Created demo user (email: demo@packlite.com, password: Demo1234!)\n`)

    const userId = demoUser.insertedId.toString()

    // Seed gear items
    console.log('⚙️  Creating sample gear items...')
    const gearCategories: Record<
      string,
      Array<{ name: string; weight: number; isEssential: boolean }>
    > = {
      'Big Three': [
        { name: 'Ultralight Tent', weight: 900, isEssential: true },
        { name: 'Down Sleeping Bag', weight: 650, isEssential: true },
        { name: 'Inflatable Sleeping Pad', weight: 450, isEssential: true },
      ],
      'Backpack & Pack': [
        { name: '60L Backpack', weight: 1200, isEssential: true },
        { name: 'Rain Cover', weight: 150, isEssential: false },
      ],
      'Cooking & Food': [
        { name: 'Portable Stove', weight: 200, isEssential: true },
        { name: 'Fuel Canister', weight: 230, isEssential: true },
        { name: 'Titanium Pot', weight: 150, isEssential: true },
        { name: 'Spork', weight: 20, isEssential: true },
      ],
      Clothing: [
        { name: 'Rain Jacket', weight: 300, isEssential: true },
        { name: 'Down Jacket', weight: 350, isEssential: true },
        { name: 'Hiking Pants', weight: 280, isEssential: true },
        { name: 'Fleece Midlayer', weight: 250, isEssential: false },
        { name: 'Base Layer Top', weight: 150, isEssential: true },
        { name: 'Base Layer Bottom', weight: 140, isEssential: true },
      ],
      'Safety & Navigation': [
        { name: 'First Aid Kit', weight: 200, isEssential: true },
        { name: 'GPS Device', weight: 180, isEssential: false },
        { name: 'Headlamp', weight: 80, isEssential: true },
        { name: 'Emergency Whistle', weight: 10, isEssential: true },
      ],
      Hygiene: [
        { name: 'Toothbrush & Paste', weight: 50, isEssential: true },
        { name: 'Biodegradable Soap', weight: 60, isEssential: true },
        { name: 'Quick-dry Towel', weight: 100, isEssential: false },
      ],
    }

    const gearItems = []
    for (const [category, items] of Object.entries(gearCategories)) {
      for (const item of items) {
        gearItems.push({
          userId,
          name: item.name,
          category,
          weight: item.weight,
          isEssential: item.isEssential,
          ownershipStatus: 'owned',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
    await db.collection('gear').insertMany(gearItems)
    console.log(`✓ Created ${gearItems.length} gear items\n`)

    // Seed food items
    console.log('🍽️  Creating sample food items...')
    const foodItems = [
      {
        userId,
        name: 'Freeze-dried Pasta',
        weight: 150,
        caloriesPer100g: 400,
        mealType: 'dinner',
        quantity: 3,
        unit: 'packs',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: 'Oatmeal',
        weight: 100,
        caloriesPer100g: 380,
        mealType: 'breakfast',
        quantity: 2,
        unit: 'packs',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: 'Energy Bars',
        weight: 60,
        caloriesPer100g: 450,
        mealType: 'snack',
        quantity: 6,
        unit: 'packs',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: 'Trail Mix',
        weight: 500,
        caloriesPer100g: 550,
        mealType: 'snack',
        quantity: 1,
        unit: 'grams',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        name: 'Instant Coffee',
        weight: 50,
        caloriesPer100g: 10,
        mealType: 'drink',
        quantity: 10,
        unit: 'packs',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    await db.collection('food').insertMany(foodItems)
    console.log(`✓ Created ${foodItems.length} food items\n`)

    // Create a sample trip
    console.log('🏔️  Creating sample trip...')
    const gearIds = await db.collection('gear').find({ userId }).limit(10).toArray()
    const foodIds = await db.collection('food').find({ userId }).limit(3).toArray()

    const trip = {
      userId,
      name: 'Weekend Mountain Hike',
      description: 'A 2-day hiking trip in the mountains',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      gearItems: gearIds.map((g) => g._id.toString()),
      foodItems: foodIds.map((f) => f._id.toString()),
      weightGoal: 10000,
      caloricGoal: 4000,
      isPublic: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.collection('trips').insertOne(trip)
    console.log('✓ Created sample trip\n')

    // Summary
    console.log('📊 Seed Summary:')
    console.log('  • 1 demo user')
    console.log(`  • ${gearItems.length} gear items`)
    console.log(`  • ${foodItems.length} food items`)
    console.log('  • 1 sample trip\n')

    console.log('✅ Database seeded successfully!\n')
    console.log('�� Demo credentials:')
    console.log('   Email: demo@packlite.com')
    console.log('   Password: Demo1234!\n')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✓ Disconnected from MongoDB\n')
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default seedDatabase
