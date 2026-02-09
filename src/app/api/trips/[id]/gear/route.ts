import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { TripModel } from '@/lib/models/trip'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const gearActionSchema = z.object({
  gearId: z.string().min(1, 'Gear ID is required'),
})

// POST /api/trips/[id]/gear - Add gear to trip
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { gearId } = gearActionSchema.parse(body)

    const trip = await TripModel.addGearToTrip(id, session.user.id, gearId)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Error adding gear to trip:', error)
    return NextResponse.json({ error: 'Failed to add gear to trip' }, { status: 500 })
  }
}

// DELETE /api/trips/[id]/gear - Remove gear from trip
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
    const gearId = searchParams.get('gearId')

    if (!gearId) {
      return NextResponse.json({ error: 'Gear ID is required' }, { status: 400 })
    }

    const trip = await TripModel.removeGearFromTrip(id, session.user.id, gearId)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error removing gear from trip:', error)
    return NextResponse.json({ error: 'Failed to remove gear from trip' }, { status: 500 })
  }
}
