'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GearForm from '@/features/gear/components/gear-form'

export default function EditGearPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gearData, setGearData] = useState<any>(null)
  const [gearId, setGearId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setGearId(p.id))
  }, [params])

  useEffect(() => {
    if (gearId) {
      fetchGear()
    }
  }, [gearId])

  const fetchGear = async () => {
    if (!gearId) return

    try {
      const response = await fetch(`/api/gear/${gearId}`)
      if (!response.ok) throw new Error('Failed to fetch gear')

      const data = await response.json()
      setGearData(data.gear)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gear')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (data: any) => {
    if (!gearId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gear/${gearId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update gear')
      }

      router.push('/gear')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gear')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!gearData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gear not found</h2>
          <Link href="/gear" className="text-primary-600 hover:text-primary-700">
            Return to gear list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/gear"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Gear
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Gear</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <GearForm
            initialData={{ ...gearData, id: gearId }}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/gear')}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
