'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Trip {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  weightGoal?: number
  isPublic: boolean
  isArchived: boolean
  gearItems: string[]
}

interface TripListProps {
  trips: Trip[]
  onDelete: (id: string) => Promise<void>
}

function getTripStatus(trip: Trip) {
  if (trip.isArchived) return { label: 'Archived', color: 'bg-gray-100 text-gray-800' }

  const now = new Date()
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)

  if (end < now) return { label: 'Past', color: 'bg-blue-100 text-blue-800' }
  if (start <= now && now <= end)
    return { label: 'In Progress', color: 'bg-green-100 text-green-800' }
  return { label: 'Upcoming', color: 'bg-purple-100 text-purple-800' }
}

export default function TripList({ trips, onDelete }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first trip.</p>
        <div className="mt-6">
          <Link
            href="/trips/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Trip
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const status = getTripStatus(trip)

        return (
          <div
            key={trip.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/trips/${trip.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                      {trip.name}
                    </h3>
                  </Link>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                  {trip.isPublic && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Public
                    </span>
                  )}
                </div>

                {trip.description && (
                  <p className="text-sm text-gray-600 mb-3">{trip.description}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span>{trip.gearItems.length} items</span>
                  </div>

                  {trip.weightGoal && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <span>Goal: {(trip.weightGoal / 1000).toFixed(1)}kg</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="text-sm text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded border border-gray-300 hover:border-primary-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this trip?')) {
                      onDelete(trip.id)
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded border border-red-300 hover:border-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
