import { NextRequest, NextResponse } from 'next/server'
import { FoodModel } from '@/lib/models/food'

// GET /api/food/batch?ids=id1,id2,id3 - Get multiple food items by IDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ food: [] })
    }

    const ids = idsParam.split(',').filter((id) => id.length > 0)
    if (ids.length === 0) {
      return NextResponse.json({ food: [] })
    }

    const food = await FoodModel.findByIds(ids)
    return NextResponse.json({ food })
  } catch (error) {
    console.error('Error fetching food batch:', error)
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 })
  }
}
