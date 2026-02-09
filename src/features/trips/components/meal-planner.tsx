'use client'

import { useState } from 'react'
import { formatWeight } from '@/lib/utils'

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

interface MealPlannerProps {
  tripId: string
  startDate: string
  endDate: string
  mealPlan: TripMeal[]
  allFood: Food[]
  onAddMeal: (day: number, mealType: string, foodId: string, quantity: number) => Promise<void>
  onRemoveMeal: (day: number, mealType: string, foodId: string) => Promise<void>
  onUpdateQuantity: (
    day: number,
    mealType: string,
    foodId: string,
    quantity: number
  ) => Promise<void>
  readOnly?: boolean
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snacks', label: 'Snacks', icon: '🍫' },
]

export default function MealPlanner({
  tripId,
  startDate,
  endDate,
  mealPlan,
  allFood,
  onAddMeal,
  onRemoveMeal,
  onUpdateQuantity,
  readOnly = false,
}: MealPlannerProps) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate number of days
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const days = Array.from({ length: diffDays }, (_, i) => i + 1)

  // Get meals for current day
  const dayMeals = mealPlan.filter((m) => m.day === selectedDay)

  // Calculate day stats
  const calculateDayStats = (day: number) => {
    const meals = mealPlan.filter((m) => m.day === day)
    let totalWeight = 0
    let totalCalories = 0

    meals.forEach((meal) => {
      const food = allFood.find((f) => f.id === meal.foodId)
      if (food) {
        totalWeight += food.weightPerUnit * meal.quantity
        totalCalories += Math.round(
          (food.weightPerUnit / 100) * food.caloriesPer100g * meal.quantity
        )
      }
    })

    return { totalWeight, totalCalories }
  }

  // Filter food for selector
  const availableFood = selectedMealType
    ? allFood.filter(
        (f) =>
          f.categories.includes(selectedMealType) &&
          (searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
      )
    : []

  const currentDayStats = calculateDayStats(selectedDay)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Meal Planning</h2>

      {/* Day Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map((day) => {
            const stats = calculateDayStats(day)
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedDay === day
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">Day {day}</div>
                {stats.totalWeight > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {formatWeight(stats.totalWeight)} | {stats.totalCalories} cal
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Day {selectedDay} Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Weight:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {formatWeight(currentDayStats.totalWeight)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Calories:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {currentDayStats.totalCalories} cal
            </span>
          </div>
        </div>
      </div>

      {/* Meals for Day */}
      <div className="space-y-4">
        {MEAL_TYPES.map((mealType) => {
          const meals = dayMeals.filter((m) => m.mealType === mealType.id)
          const isAdding = selectedMealType === mealType.id

          return (
            <div key={mealType.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  {mealType.icon} {mealType.label}
                </h4>
                {!readOnly && availableFood.length > 0 && (
                  <button
                    onClick={() => setSelectedMealType(isAdding ? null : mealType.id)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {isAdding ? 'Cancel' : '+ Add'}
                  </button>
                )}
              </div>

              {/* Food Selector */}
              {!readOnly && isAdding && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Search food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {availableFood.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => {
                          onAddMeal(selectedDay, mealType.id, food.id, 1)
                          setSelectedMealType(null)
                          setSearchQuery('')
                        }}
                        className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:border-primary-500 text-left"
                      >
                        <span className="text-sm font-medium text-gray-900">{food.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatWeight(food.weightPerUnit)} |{' '}
                          {Math.round((food.weightPerUnit / 100) * food.caloriesPer100g)} cal
                        </span>
                      </button>
                    ))}
                    {availableFood.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No food found for this meal
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Meal Items */}
              {meals.length === 0 ? (
                <p className="text-sm text-gray-500">No items added</p>
              ) : (
                <div className="space-y-2">
                  {meals.map((meal) => {
                    const food = allFood.find((f) => f.id === meal.foodId)
                    if (!food) return null

                    const totalWeight = food.weightPerUnit * meal.quantity
                    const totalCals = Math.round(
                      (food.weightPerUnit / 100) * food.caloriesPer100g * meal.quantity
                    )

                    return (
                      <div
                        key={`${meal.day}-${meal.mealType}-${meal.foodId}`}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{food.name}</span>
                          <div className="text-xs text-gray-500">
                            {formatWeight(totalWeight)} | {totalCals} cal
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {readOnly ? (
                            <span className="text-sm text-gray-600">Qty: {meal.quantity}</span>
                          ) : (
                            <>
                              <input
                                type="number"
                                min="1"
                                value={meal.quantity}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value)
                                  if (qty >= 1) {
                                    onUpdateQuantity(selectedDay, mealType.id, meal.foodId, qty)
                                  }
                                }}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                onClick={() => onRemoveMeal(selectedDay, mealType.id, meal.foodId)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
