'use client'

import Link from 'next/link'

interface Food {
  id: string
  name: string
  categories: string[]
  weightPerUnit: number
  caloriesPer100g: number
  description?: string
}

interface FoodListProps {
  food: Food[]
  onDelete: (id: string) => Promise<void>
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`
  return `${grams}g`
}

function calculateCalories(weightPerUnit: number, caloriesPer100g: number): number {
  return Math.round((weightPerUnit / 100) * caloriesPer100g)
}

export default function FoodList({ food, onDelete }: FoodListProps) {
  if (food.length === 0) {
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No food items yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first food item.</p>
        <div className="mt-6">
          <Link
            href="/pantry/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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
            Add Food
          </Link>
        </div>
      </div>
    )
  }

  // Group food by categories
  const categoryGroups: Record<string, Food[]> = {}
  food.forEach((item) => {
    item.categories.forEach((cat) => {
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push(item)
    })
  })

  return (
    <div className="space-y-6">
      {Object.entries(categoryGroups).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/pantry/${item.id}/edit`}>
                      <h4 className="text-base font-semibold text-gray-900 hover:text-primary-600">
                        {item.name}
                      </h4>
                    </Link>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this food item?')) {
                          onDelete(item.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatWeight(item.weightPerUnit)} / unit
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Calories:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {calculateCalories(item.weightPerUnit, item.caloriesPer100g)} / unit
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
