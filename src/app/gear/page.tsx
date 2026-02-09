'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import GearList from '@/features/gear/components/gear-list'
import { GearItem } from '@/types'

export default function GearPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [gear, setGear] = useState<GearItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchGear()
    }
  }, [status, router])

  const fetchGear = async () => {
    try {
      const response = await fetch('/api/gear')
      if (!response.ok) throw new Error('Failed to fetch gear')

      const data = await response.json()
      setGear(data.gear)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gear')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gear item?')) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/gear/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete gear')

      setGear(gear.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gear')
    } finally {
      setIsDeleting(null)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const totalWeight = gear.reduce((sum, item) => sum + item.weight, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Gear</h1>
              <p className="mt-2 text-sm text-gray-600">
                {gear.length} items • Total weight: {totalWeight}g (
                {(totalWeight / 1000).toFixed(2)}kg)
              </p>
            </div>
            <Link
              href="/gear/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Gear
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Gear List */}
        <GearList gear={gear} onDelete={handleDelete} isDeleting={isDeleting} />
      </div>
    </div>
  )
}
