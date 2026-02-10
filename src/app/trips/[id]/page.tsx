'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDate, formatWeight } from '@/lib/utils'
import MealPlanner from '@/features/trips/components/meal-planner'
import CategoryWeightPieChart from '@/components/molecules/category-weight-pie-chart'

interface GearItem {
  id: string
  name: string
  category: string
  weight: number
  status: 'owned' | 'borrowed' | 'need-to-buy'
}

interface Food {
  id: string
  name: string
  categories: string[]
  weightPerUnit: number
  caloriesPer100g: number
}

interface TripMeal {
  day: number
  mealType: string
  foodId: string
  quantity: number
}

interface Trip {
  id: string
  userId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  weightGoal?: number
  isPublic: boolean
  isArchived: boolean
  gearItems: string[]
  mealPlan: TripMeal[]
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [gear, setGear] = useState<GearItem[]>([])
  const [food, setFood] = useState<Food[]>([])
  const [allGear, setAllGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showGearSelector, setShowGearSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    // Always try to fetch trip data, regardless of auth status
    // Public trips can be viewed by anyone
    if (status === 'loading') return

    fetchTripData()
  }, [status, params.id])

  const fetchTripData = async () => {
    try {
      // Fetch trip (works for both public and private if authenticated)
      const tripResponse = await fetch(`/api/trips/${params.id}`)
      if (!tripResponse.ok) {
        if (tripResponse.status === 404) {
          alert('Trip not found')
        } else if (tripResponse.status === 401) {
          router.push('/auth/signin')
          return
        }
        router.push('/trips')
        return
      }
      const tripData = await tripResponse.json()
      setTrip(tripData.trip)

      // Fetch gear items that are in this trip
      if (tripData.trip.gearItems && tripData.trip.gearItems.length > 0) {
        const gearIds = tripData.trip.gearItems.join(',')
        const gearResponse = await fetch(`/api/gear/batch?ids=${gearIds}`)
        if (gearResponse.ok) {
          const gearData = await gearResponse.json()
          setGear(gearData.gear)
        }
      }

      // Fetch food items that are in meal plan
      const foodIds = [...new Set((tripData.trip.mealPlan || []).map((m: TripMeal) => m.foodId))]
      let fetchedFood: Food[] = []
      if (foodIds.length > 0) {
        const foodIdsParam = foodIds.join(',')
        const foodResponse = await fetch(`/api/food/batch?ids=${foodIdsParam}`)
        if (foodResponse.ok) {
          const foodData = await foodResponse.json()
          fetchedFood = foodData.food
          setFood(foodData.food)
        }
      }

      // If authenticated, also fetch all user's gear and food for editing
      if (session?.user?.id && tripData.trip.userId === session.user.id) {
        // Fetch all gear for the selector
        const allGearResponse = await fetch('/api/gear')
        if (allGearResponse.ok) {
          const allGearData = await allGearResponse.json()
          setAllGear(allGearData.gear)
        }

        // Fetch all food for the meal planner
        const allFoodResponse = await fetch('/api/food')
        if (allFoodResponse.ok) {
          const allFoodData = await allFoodResponse.json()
          // Merge with existing food to avoid duplicates
          const existingFoodIds = new Set(fetchedFood.map((f) => f.id))
          const newFood = allFoodData.food.filter((f: Food) => !existingFoodIds.has(f.id))
          setFood([...fetchedFood, ...newFood])
        }
      }
    } catch (error) {
      console.error('Error fetching trip data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGear = async (gearId: string) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/gear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gearId }),
      })

      if (response.ok) {
        const data = await response.json()
        setTrip(data.trip)

        // Add gear to local state
        const gearItem = allGear.find((g) => g.id === gearId)
        if (gearItem) {
          setGear([...gear, gearItem])
        }
      } else {
        alert('Failed to add gear')
      }
    } catch (error) {
      console.error('Error adding gear:', error)
      alert('Failed to add gear')
    }
  }

  const handleRemoveGear = async (gearId: string) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/gear?gearId=${gearId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setTrip(data.trip)
        setGear(gear.filter((g) => g.id !== gearId))
      } else {
        alert('Failed to remove gear')
      }
    } catch (error) {
      console.error('Error removing gear:', error)
      alert('Failed to remove gear')
    }
  }

  // Meal handlers
  const handleAddMeal = async (day: number, mealType: string, foodId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/trips/${params.id}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, mealType, foodId, quantity }),
      })
      if (res.ok) {
        fetchTripData()
      }
    } catch (error) {
      console.error('Error adding meal:', error)
    }
  }

  const handleRemoveMeal = async (day: number, mealType: string, foodId: string) => {
    try {
      const res = await fetch(
        `/api/trips/${params.id}/meals?day=${day}&mealType=${mealType}&foodId=${foodId}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        fetchTripData()
      }
    } catch (error) {
      console.error('Error removing meal:', error)
    }
  }

  const handleUpdateQuantity = async (
    day: number,
    mealType: string,
    foodId: string,
    quantity: number
  ) => {
    try {
      const res = await fetch(
        `/api/trips/${params.id}/meals?day=${day}&mealType=${mealType}&foodId=${foodId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        }
      )
      if (res.ok) {
        fetchTripData()
      }
    } catch (error) {
      console.error('Error updating meal quantity:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return null
  }

  // Check if user owns this trip
  const isOwner = session?.user?.id === trip.userId
  const canEdit = isOwner

  // Calculate weights by category
  const gearByCategory = gear.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, GearItem[]>
  )

  const totalWeight = gear.reduce((sum, item) => sum + item.weight, 0)
  const categoryWeights = Object.entries(gearByCategory).map(([category, items]) => ({
    category,
    weight: items.reduce((sum, item) => sum + item.weight, 0),
    count: items.length,
  }))

  const weightProgress = trip.weightGoal ? (totalWeight / trip.weightGoal) * 100 : null
  const isOverWeight = trip.weightGoal && totalWeight > trip.weightGoal

  // Available gear (not in trip)
  let availableGear = allGear.filter((g) => !trip.gearItems.includes(g.id))

  // Apply search filter
  if (searchQuery) {
    availableGear = availableGear.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Apply category filter
  if (categoryFilter !== 'all') {
    availableGear = availableGear.filter((g) => g.category === categoryFilter)
  }

  // Get unique categories from all gear
  const categories = Array.from(new Set(allGear.map((g) => g.category))).sort()

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/trips"
              className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
            >
              ← Back to Trips
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
            {trip.description && <p className="mt-2 text-gray-600">{trip.description}</p>}
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>
                {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
              </span>
              {trip.isPublic && <span className="text-amber-600">• Public</span>}
              {trip.isArchived && <span className="text-gray-600">• Archived</span>}
            </div>
          </div>
          <Link
            href={`/trips/${trip.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Edit Trip
          </Link>
        </div>
      </div>

      {/* Weight Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pack Weight</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Weight</p>
            <p className="text-2xl font-bold text-gray-900">{formatWeight(totalWeight)}</p>
          </div>
          {trip.weightGoal && (
            <>
              <div>
                <p className="text-sm text-gray-500">Weight Goal</p>
                <p className="text-2xl font-bold text-gray-900">{formatWeight(trip.weightGoal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difference</p>
                <p
                  className={`text-2xl font-bold ${isOverWeight ? 'text-red-600' : 'text-green-600'}`}
                >
                  {isOverWeight ? '+' : ''}
                  {formatWeight(totalWeight - trip.weightGoal)}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-2xl font-bold text-gray-900">{gear.length}</p>
          </div>
        </div>

        {weightProgress !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to Goal</span>
              <span>{weightProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isOverWeight ? 'bg-red-600' : 'bg-green-600'}`}
                style={{ width: `${Math.min(weightProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoryWeights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight by Category</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table */}
            <div className="space-y-2">
              {categoryWeights.map(({ category, weight, count }) => (
                <div
                  key={category}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{category}</span>
                    <span className="ml-2 text-xs text-gray-500">({count} items)</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatWeight(weight)}
                  </span>
                </div>
              ))}
            </div>
            {/* Pie Chart */}
            <div className="flex items-center justify-center min-h-[300px]">
              <CategoryWeightPieChart
                categoryWeights={categoryWeights}
                formatWeight={formatWeight}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gear List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Gear Items</h2>
          {canEdit && (
            <button
              onClick={() => setShowGearSelector(!showGearSelector)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
            >
              {showGearSelector ? 'Hide' : 'Add Gear'}
            </button>
          )}
        </div>

        {showGearSelector && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select gear to add</h3>

            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
              {/* Search Input */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    categoryFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({allGear.filter((g) => !trip.gearItems.includes(g.id)).length})
                </button>
                {categories.map((category) => {
                  const count = allGear.filter(
                    (g) => g.category === category && !trip.gearItems.includes(g.id)
                  ).length
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        categoryFilter === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Gear List */}
            {availableGear.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || categoryFilter !== 'all' ? (
                  <p>No gear found matching your filters.</p>
                ) : (
                  <p>All your gear has been added to this trip!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {availableGear.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleAddGear(item.id)
                      setSearchQuery('')
                    }}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded hover:border-primary-500 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 ml-2">
                      {formatWeight(item.weight)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Results count */}
            {availableGear.length > 0 && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                Showing {availableGear.length} item{availableGear.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {gear.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No gear added yet{canEdit ? '. Click "Add Gear" to get started' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(gearByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatWeight(item.weight)}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveGear(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meal Planning Section - Show for everyone but only editable for owner */}
      {trip.mealPlan && trip.mealPlan.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Meal Planning{' '}
            {!canEdit && <span className="text-sm font-normal text-gray-500">(View Only)</span>}
          </h2>
          <MealPlanner
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            mealPlan={trip.mealPlan || []}
            allFood={food}
            onAddMeal={canEdit ? handleAddMeal : async () => {}}
            onRemoveMeal={canEdit ? handleRemoveMeal : async () => {}}
            onUpdateQuantity={canEdit ? handleUpdateQuantity : async () => {}}
            readOnly={!canEdit}
          />
        </div>
      )}

      {/* Show meal planner for owners even if empty */}
      {canEdit && (!trip.mealPlan || trip.mealPlan.length === 0) && (
        <MealPlanner
          tripId={trip.id}
          startDate={trip.startDate}
          endDate={trip.endDate}
          mealPlan={trip.mealPlan || []}
          allFood={food}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          onUpdateQuantity={handleUpdateQuantity}
          readOnly={false}
        />
      )}
    </div>
  )
}
