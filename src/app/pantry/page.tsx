'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import FoodList from '@/features/pantry/components/food-list'

interface Food {
  id: string
  name: string
  categories: string[]
  weightPerUnit: number
  caloriesPer100g: number
  description?: string
}

export default function PantryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [food, setFood] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchFood()
    }
  }, [status, router, categoryFilter])

  const fetchFood = async () => {
    try {
      const url = categoryFilter === 'all' ? '/api/food' : `/api/food?category=${categoryFilter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setFood(data.food)
      }
    } catch (error) {
      console.error('Error fetching food:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/food/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setFood(food.filter((item) => item.id !== id))
      } else {
        alert('Failed to delete food item')
      }
    } catch (error) {
      console.error('Error deleting food:', error)
      alert('Failed to delete food item')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pantry...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const categories = ['breakfast', 'lunch', 'dinner', 'snacks']

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pantry</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your food inventory</p>
        </div>
        <Link
          href="/pantry/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Food
        </Link>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            categoryFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap capitalize ${
              categoryFilter === cat
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <FoodList food={food} onDelete={handleDelete} />
    </div>
  )
}
