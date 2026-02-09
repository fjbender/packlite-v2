import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { FoodModel } from '@/lib/models/food'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const foodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  categories: z
    .array(z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
    .min(1, 'At least one category is required'),
  weightPerUnit: z.number().min(1, 'Weight per unit must be positive'),
  caloriesPer100g: z.number().min(0, 'Calories cannot be negative'),
  description: z.string().max(500).optional().or(z.literal('')),
})

// GET /api/food - Get all food items for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as
      | 'breakfast'
      | 'lunch'
      | 'dinner'
      | 'snacks'
      | null

    let food
    if (category) {
      food = await FoodModel.findByCategory(session.user.id, category)
    } else {
      food = await FoodModel.findByUserId(session.user.id)
    }

    return NextResponse.json({ food })
  } catch (error) {
    console.error('Error fetching food:', error)
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 })
  }
}

// POST /api/food - Create a new food item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = foodSchema.parse(body)

    const food = await FoodModel.create({
      userId: session.user.id,
      name: validatedData.name,
      categories: validatedData.categories,
      weightPerUnit: validatedData.weightPerUnit,
      caloriesPer100g: validatedData.caloriesPer100g,
      description: validatedData.description || undefined,
    })

    return NextResponse.json({ food }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating food:', error)
    return NextResponse.json({ error: 'Failed to create food' }, { status: 500 })
  }
}
