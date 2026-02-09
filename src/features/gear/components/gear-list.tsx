'use client'

import Link from 'next/link'
import { GearItem } from '@/types'

interface GearListProps {
  gear: GearItem[]
  onDelete: (id: string) => void
  isDeleting?: string | null
}

export default function GearList({ gear, onDelete, isDeleting }: GearListProps) {
  if (gear.length === 0) {
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No gear items</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first gear item.</p>
        <div className="mt-6">
          <Link
            href="/gear/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Gear
          </Link>
        </div>
      </div>
    )
  }

  // Group gear by category
  const groupedGear = gear.reduce(
    (acc, item) => {
      const category = item.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, GearItem[]>
  )

  return (
    <div className="space-y-8">
      {Object.entries(groupedGear).map(([category, items]) => {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)

        return (
          <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                <span className="text-sm text-gray-500">
                  {items.length} items • {totalWeight}g
                </span>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        {item.isEssential && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Essential
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.ownershipStatus === 'owned'
                              ? 'bg-green-100 text-green-800'
                              : item.ownershipStatus === 'borrowed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.ownershipStatus === 'owned'
                            ? 'Owned'
                            : item.ownershipStatus === 'borrowed'
                              ? 'Borrowed'
                              : 'Need to Buy'}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-sm text-gray-500 truncate">{item.notes}</p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">{item.weight}g</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/gear/${item.id}/edit`}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => onDelete(item.id)}
                          disabled={isDeleting === item.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
