'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FoodForm from '@/features/pantry/components/food-form'

export default function EditFoodPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [food, setFood] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchFood()
    }
  }, [status, router, params.id])

  const fetchFood = async () => {
    try {
      const response = await fetch(`/api/food/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setFood(data.food)
      } else {
        alert('Food item not found')
        router.push('/pantry')
      }
    } catch (error) {
      console.error('Error fetching food:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/food/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/pantry')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update food item')
      }
    } catch (error) {
      console.error('Error updating food:', error)
      alert('Failed to update food item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/pantry')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!session || !food) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Food Item</h1>
        <p className="mt-1 text-sm text-gray-600">Update food details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FoodForm
          initialData={food}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
