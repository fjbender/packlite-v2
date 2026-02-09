'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import TripForm from '@/features/trips/components/trip-form'

export default function EditTripPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [trip, setTrip] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchTrip()
    }
  }, [status, router, params.id])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        // Format dates for input fields
        const formattedTrip = {
          ...data.trip,
          startDate: data.trip.startDate.split('T')[0],
          endDate: data.trip.endDate.split('T')[0],
        }
        setTrip(formattedTrip)
      } else {
        alert('Trip not found')
        router.push('/trips')
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/trips/${params.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update trip')
      }
    } catch (error) {
      console.error('Error updating trip:', error)
      alert('Failed to update trip')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/trips/${params.id}`)
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

  if (!session || !trip) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
        <p className="mt-1 text-sm text-gray-600">Update your trip details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TripForm
          initialData={trip}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
