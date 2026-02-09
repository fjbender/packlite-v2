import { NextRequest, NextResponse } from 'next/server'
import { GearModel } from '@/lib/models/gear'

// GET /api/gear/batch?ids=id1,id2,id3 - Get multiple gear items by IDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ gear: [] })
    }

    const ids = idsParam.split(',').filter((id) => id.length > 0)
    if (ids.length === 0) {
      return NextResponse.json({ gear: [] })
    }

    const gear = await GearModel.findByIds(ids)
    return NextResponse.json({ gear })
  } catch (error) {
    console.error('Error fetching gear batch:', error)
    return NextResponse.json({ error: 'Failed to fetch gear' }, { status: 500 })
  }
}
