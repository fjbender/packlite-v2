import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export interface Food {
  _id?: ObjectId
  id?: string
  userId: string
  name: string
  categories: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[]
  weightPerUnit: number
  caloriesPer100g: number
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export class FoodModel {
  private static async getCollection() {
    const client = await clientPromise
    return client.db('packlite').collection<Food>('food')
  }

  static async findByUserId(userId: string): Promise<Food[]> {
    const collection = await this.getCollection()
    const foods = await collection.find({ userId }).sort({ name: 1 }).toArray()
    return foods.map((food) => ({
      ...food,
      id: food._id!.toString(),
    }))
  }

  static async findByCategory(userId: string, category: string): Promise<Food[]> {
    const collection = await this.getCollection()
    const foods = await collection
      .find({ userId, categories: { $in: [category as any] } })
      .sort({ name: 1 })
      .toArray()
    return foods.map((food) => ({
      ...food,
      id: food._id!.toString(),
    }))
  }

  static async findById(id: string, userId: string): Promise<Food | null> {
    const collection = await this.getCollection()
    const food = await collection.findOne({ _id: new ObjectId(id), userId })
    if (!food) return null
    return { ...food, id: food._id!.toString() }
  }

  static async findByIds(ids: string[]): Promise<Food[]> {
    const collection = await this.getCollection()
    const objectIds = ids.map((id) => new ObjectId(id))
    const foodItems = await collection.find({ _id: { $in: objectIds } }).toArray()
    return foodItems.map((food) => ({ ...food, id: food._id!.toString() }))
  }

  static async create(data: Omit<Food, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Food> {
    const collection = await this.getCollection()
    const now = new Date()
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Food)
    return {
      ...data,
      _id: result.insertedId,
      id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now,
    }
  }

  static async updateById(
    id: string,
    userId: string,
    data: Partial<Omit<Food, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Food | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id!.toString() }
  }

  static async deleteById(id: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId })
    return result.deletedCount > 0
  }
}
