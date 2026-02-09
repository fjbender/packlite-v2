import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export interface GearDocument {
  _id?: ObjectId
  userId: string
  name: string
  category: string
  weight: number // in grams
  photo?: string
  notes?: string
  isEssential: boolean
  ownershipStatus: 'owned' | 'borrowed' | 'need-to-buy'
  createdAt: Date
  updatedAt: Date
}

export class GearModel {
  private static async getCollection() {
    const client = await clientPromise
    return client.db('packlite').collection<GearDocument>('gear')
  }

  static async findByUserId(userId: string) {
    const collection = await this.getCollection()
    const gear = await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
    return gear.map((item) => ({ ...item, id: item._id.toString() }))
  }

  static async findById(id: string, userId: string) {
    const collection = await this.getCollection()
    const gear = await collection.findOne({ _id: new ObjectId(id), userId })
    if (!gear) return null
    return { ...gear, id: gear._id.toString() }
  }

  static async findByIds(ids: string[]) {
    const collection = await this.getCollection()
    const objectIds = ids.map((id) => new ObjectId(id))
    const gearItems = await collection.find({ _id: { $in: objectIds } }).toArray()
    return gearItems.map((gear) => ({ ...gear, id: gear._id.toString() }))
  }

  static async create(data: Omit<GearDocument, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection()
    const now = new Date()
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
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
    data: Partial<Omit<GearDocument, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return { ...result, id: result._id.toString() }
  }

  static async deleteById(id: string, userId: string) {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId })
    return result.deletedCount > 0
  }

  static async countByUserId(userId: string) {
    const collection = await this.getCollection()
    return await collection.countDocuments({ userId })
  }

  static async findByCategory(userId: string, category: string) {
    const collection = await this.getCollection()
    const gear = await collection.find({ userId, category }).sort({ createdAt: -1 }).toArray()
    return gear.map((item) => ({ ...item, id: item._id.toString() }))
  }
}
