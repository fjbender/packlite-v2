import { Db, MongoClient } from 'mongodb'
import { User as NextAuthUser } from 'next-auth'

export interface UserDocument {
  _id?: string
  email: string
  name: string
  password: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export class UserModel {
  private db: Db

  constructor(client: MongoClient) {
    this.db = client.db('packlite')
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.db.collection<UserDocument>('users').findOne({ email })
  }

  async findById(id: string): Promise<UserDocument | null> {
    const { ObjectId } = require('mongodb')
    return await this.db.collection<UserDocument>('users').findOne({ _id: new ObjectId(id) })
  }

  async create(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const result = await this.db.collection<UserDocument>('users').insertOne({
      ...userData,
      createdAt: now,
      updatedAt: now,
    })
    return result.insertedId.toString()
  }

  async updateById(
    id: string,
    updates: Partial<Omit<UserDocument, '_id' | 'createdAt'>>
  ): Promise<boolean> {
    const { ObjectId } = require('mongodb')
    const result = await this.db.collection<UserDocument>('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    )
    return result.modifiedCount > 0
  }
}
