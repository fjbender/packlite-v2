import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { GearModel } from '@/lib/models/gear'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const gearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  weight: z.number().min(0, 'Weight must be positive'),
  photo: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  isEssential: z.boolean(),
  ownershipStatus: z.enum(['owned', 'borrowed', 'need-to-buy']),
})

// GET /api/gear - Get all gear for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let gear
    if (category) {
      gear = await GearModel.findByCategory(session.user.id, category)
    } else {
      gear = await GearModel.findByUserId(session.user.id)
    }

    return NextResponse.json({ gear })
  } catch (error) {
    console.error('Error fetching gear:', error)
    return NextResponse.json({ error: 'Failed to fetch gear' }, { status: 500 })
  }
}

// POST /api/gear - Create a new gear item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = gearSchema.parse(body)

    const gear = await GearModel.create({
      userId: session.user.id,
      ...validatedData,
    })

    return NextResponse.json({ gear }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error creating gear:', error)
    return NextResponse.json({ error: 'Failed to create gear' }, { status: 500 })
  }
}
