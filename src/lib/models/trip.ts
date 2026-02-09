import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export interface TripMeal {
  day: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  foodId: string
  quantity: number
}

export interface TripDocument {
  _id?: ObjectId
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  gearItems: string[]
  mealPlan: TripMeal[]
  weightGoal?: number
  caloricGoal?: number
  isPublic: boolean
  shareLink?: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export class TripModel {
  private static async getCollection() {
    const client = await clientPromise
    return client.db('packlite').collection<TripDocument>('trips')
  }

  static async findByUserId(userId: string, includeArchived = false) {
    const collection = await this.getCollection()
    const filter: any = { userId }
    if (!includeArchived) {
      filter.isArchived = false
    }
    const trips = await collection.find(filter).sort({ startDate: -1 }).toArray()
    return trips.map((trip) => ({ ...trip, id: trip._id!.toString() }))
  }

  static async findById(id: string, userId: string) {
    const collection = await this.getCollection()
    const trip = await collection.findOne({ _id: new ObjectId(id), userId })
    if (!trip) return null
    return { ...trip, id: trip._id!.toString() }
  }

  static async findByIdPublic(id: string) {
    const collection = await this.getCollection()
    const trip = await collection.findOne({ _id: new ObjectId(id), isPublic: true })
    if (!trip) return null
    return { ...trip, id: trip._id!.toString() }
  }

  static async create(data: Omit<TripDocument, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection()
    const now = new Date()
    const result = await collection.insertOne({
      ...data,
      gearItems: data.gearItems || [],
      mealPlan: data.mealPlan || [],
      createdAt: now,
      updatedAt: now,
    })
    return {
      ...data,
      gearItems: data.gearItems || [],
      mealPlan: data.mealPlan || [],
      _id: result.insertedId,
      id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now,
    }
  }

  static async updateById(
    id: string,
    userId: string,
    data: Partial<Omit<TripDocument, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  static async deleteById(id: string, userId: string) {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId })
    return result.deletedCount > 0
  }

  static async addGearToTrip(tripId: string, userId: string, gearId: string) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(tripId), userId },
      { $addToSet: { gearItems: gearId }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  static async removeGearFromTrip(tripId: string, userId: string, gearId: string) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(tripId), userId },
      { $pull: { gearItems: gearId }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  static async archiveTrip(id: string, userId: string) {
    return this.updateById(id, userId, { isArchived: true })
  }

  static async unarchiveTrip(id: string, userId: string) {
    return this.updateById(id, userId, { isArchived: false })
  }

  static async countByUserId(userId: string) {
    const collection = await this.getCollection()
    return await collection.countDocuments({ userId, isArchived: false })
  }

  // Add meal to trip
  static async addMealToTrip(tripId: string, userId: string, meal: TripMeal) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(tripId), userId },
      {
        $push: { mealPlan: meal },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  // Remove meal from trip
  static async removeMealFromTrip(
    tripId: string,
    userId: string,
    day: number,
    mealType: string,
    foodId: string
  ) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(tripId), userId },
      {
        $pull: { mealPlan: { day, mealType, foodId } as any },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  // Update meal quantity
  static async updateMealQuantity(
    tripId: string,
    userId: string,
    day: number,
    mealType: string,
    foodId: string,
    quantity: number
  ) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(tripId),
        userId,
        'mealPlan.day': day,
        'mealPlan.mealType': mealType,
        'mealPlan.foodId': foodId,
      },
      {
        $set: {
          'mealPlan.$.quantity': quantity,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }
}
