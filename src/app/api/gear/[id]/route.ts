import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { GearModel } from '@/lib/models/gear'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const gearUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(),
  weight: z.number().min(0).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  isEssential: z.boolean().optional(),
  ownershipStatus: z.enum(['owned', 'borrowed', 'need-to-buy']).optional(),
})

// GET /api/gear/[id] - Get a single gear item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const gear = await GearModel.findById(id, session.user.id)
    if (!gear) {
      return NextResponse.json({ error: 'Gear not found' }, { status: 404 })
    }

    return NextResponse.json({ gear })
  } catch (error) {
    console.error('Error fetching gear:', error)
    return NextResponse.json({ error: 'Failed to fetch gear' }, { status: 500 })
  }
}

// PUT /api/gear/[id] - Update a gear item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = gearUpdateSchema.parse(body)

    const gear = await GearModel.updateById(id, session.user.id, validatedData)
    if (!gear) {
      return NextResponse.json({ error: 'Gear not found' }, { status: 404 })
    }

    return NextResponse.json({ gear })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error updating gear:', error)
    return NextResponse.json({ error: 'Failed to update gear' }, { status: 500 })
  }
}

// DELETE /api/gear/[id] - Delete a gear item
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
    const deleted = await GearModel.deleteById(id, session.user.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Gear not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gear:', error)
    return NextResponse.json({ error: 'Failed to delete gear' }, { status: 500 })
  }
}
