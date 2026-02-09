import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { FoodModel } from '@/lib/models/food'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const foodUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  categories: z
    .array(z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
    .min(1)
    .optional(),
  weightPerUnit: z.number().min(1).optional(),
  caloriesPer100g: z.number().min(0).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
})

// GET /api/food/[id] - Get a single food item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const food = await FoodModel.findById(id, session.user.id)
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 })
    }

    return NextResponse.json({ food })
  } catch (error) {
    console.error('Error fetching food:', error)
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 })
  }
}

// PUT /api/food/[id] - Update a food item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = foodUpdateSchema.parse(body)

    const food = await FoodModel.updateById(id, session.user.id, validatedData)
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 })
    }

    return NextResponse.json({ food })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating food:', error)
    return NextResponse.json({ error: 'Failed to update food' }, { status: 500 })
  }
}

// DELETE /api/food/[id] - Delete a food item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await FoodModel.deleteById(id, session.user.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting food:', error)
    return NextResponse.json({ error: 'Failed to delete food' }, { status: 500 })
  }
}
