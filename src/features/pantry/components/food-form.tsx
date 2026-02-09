'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const MEAL_CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
] as const

const foodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  categories: z
    .array(z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
    .min(1, 'Select at least one category'),
  weightPerUnit: z.number().min(1, 'Weight must be positive'),
  caloriesPer100g: z.number().min(0, 'Calories cannot be negative'),
  description: z.string().max(500).optional(),
})

type FoodFormData = z.infer<typeof foodSchema>

interface FoodFormProps {
  initialData?: FoodFormData & { id?: string }
  onSubmit: (data: FoodFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function FoodForm({ initialData, onSubmit, onCancel, isLoading }: FoodFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: initialData || {
      name: '',
      categories: [],
      weightPerUnit: 100,
      caloriesPer100g: 0,
      description: '',
    },
  })

  const selectedCategories = watch('categories') || []

  const toggleCategory = (category: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const current = selectedCategories
    if (current.includes(category)) {
      setValue(
        'categories',
        current.filter((c) => c !== category)
      )
    } else {
      setValue('categories', [...current, category])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Food Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Instant Oatmeal, Energy Bar"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meal Categories * (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`px-4 py-2 rounded-md border-2 transition-colors ${
                selectedCategories.includes(category.id)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
        )}
      </div>

      {/* Weight and Calories */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="weightPerUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Weight per Unit (grams) *
          </label>
          <input
            {...register('weightPerUnit', { valueAsNumber: true })}
            type="number"
            id="weightPerUnit"
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="100"
          />
          {errors.weightPerUnit && (
            <p className="mt-1 text-sm text-red-600">{errors.weightPerUnit.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Weight of one serving/unit</p>
        </div>
        <div>
          <label htmlFor="caloriesPer100g" className="block text-sm font-medium text-gray-700 mb-1">
            Calories per 100g *
          </label>
          <input
            {...register('caloriesPer100g', { valueAsNumber: true })}
            type="number"
            id="caloriesPer100g"
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="350"
          />
          {errors.caloriesPer100g && (
            <p className="mt-1 text-sm text-red-600">{errors.caloriesPer100g.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Nutritional info per 100g</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Add notes, brand, or preparation info..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Food' : 'Add Food'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
