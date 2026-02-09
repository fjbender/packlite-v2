'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GearForm from '@/features/gear/components/gear-form'

export default function NewGearPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create gear')
      }

      router.push('/gear')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gear')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Gear</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <GearForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/gear')}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
