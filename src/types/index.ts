// Shared TypeScript types for the application

export interface GearItem {
  id: string
  userId: string
  name: string
  category: string
  weight: number // in grams
  photo?: string // S3 URL
  notes?: string
  isEssential: boolean
  ownershipStatus: 'owned' | 'borrowed' | 'need-to-buy'
  createdAt: Date
  updatedAt: Date
}

export interface FoodItem {
  id: string
  userId: string
  name: string
  weight: number // in grams
  caloriesPer100g: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
  quantity: number
  unit: 'packs' | 'grams' | 'liters'
  expirationDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Trip {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  gearItems: string[] // GearItem IDs
  foodItems: string[] // FoodItem IDs
  weightGoal?: number // in grams
  caloricGoal?: number
  isPublic: boolean
  shareLink?: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export type WeightUnit = 'grams' | 'ounces' | 'pounds'
