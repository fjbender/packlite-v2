import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { TripModel } from '@/lib/models/trip'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const tripSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  weightGoal: z.number().min(0).optional(),
  isPublic: z.boolean(),
})

// GET /api/trips - Get all trips for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('archived') === 'true'

    const trips = await TripModel.findByUserId(session.user.id, includeArchived)

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = tripSchema.parse(body)

    const trip = await TripModel.create({
      userId: session.user.id,
      name: validatedData.name,
      description: validatedData.description || undefined,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      weightGoal: validatedData.weightGoal,
      isPublic: validatedData.isPublic,
      gearItems: [],
      mealPlan: [],
      isArchived: false,
    })

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating trip:', error)
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
