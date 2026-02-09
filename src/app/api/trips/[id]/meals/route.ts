import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { TripModel } from '@/lib/models/trip'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const addMealSchema = z.object({
  day: z.number().min(1, 'Day must be at least 1'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
  foodId: z.string().min(1, 'Food ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

const updateQuantitySchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

// POST /api/trips/[id]/meals - Add meal to trip
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = addMealSchema.parse(body)

    const trip = await TripModel.addMealToTrip(id, session.user.id, {
      day: validatedData.day,
      mealType: validatedData.mealType,
      foodId: validatedData.foodId,
      quantity: validatedData.quantity,
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error adding meal to trip:', error)
    return NextResponse.json({ error: 'Failed to add meal to trip' }, { status: 500 })
  }
}

// DELETE /api/trips/[id]/meals - Remove meal from trip
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
    const { searchParams } = new URL(request.url)
    const day = parseInt(searchParams.get('day') || '0')
    const mealType = searchParams.get('mealType')
    const foodId = searchParams.get('foodId')

    if (!day || !mealType || !foodId) {
      return NextResponse.json({ error: 'Day, mealType, and foodId are required' }, { status: 400 })
    }

    const trip = await TripModel.removeMealFromTrip(id, session.user.id, day, mealType, foodId)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error removing meal from trip:', error)
    return NextResponse.json({ error: 'Failed to remove meal from trip' }, { status: 500 })
  }
}

// PATCH /api/trips/[id]/meals - Update meal quantity
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const day = parseInt(searchParams.get('day') || '0')
    const mealType = searchParams.get('mealType')
    const foodId = searchParams.get('foodId')

    if (!day || !mealType || !foodId) {
      return NextResponse.json({ error: 'Day, mealType, and foodId are required' }, { status: 400 })
    }

    const body = await request.json()
    const { quantity } = updateQuantitySchema.parse(body)

    const trip = await TripModel.updateMealQuantity(
      id,
      session.user.id,
      day,
      mealType,
      foodId,
      quantity
    )

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found or meal not found' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating meal quantity:', error)
    return NextResponse.json({ error: 'Failed to update meal quantity' }, { status: 500 })
  }
}
