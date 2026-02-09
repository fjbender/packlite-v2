'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const gearCategories = [
  'Big Three',
  'Backpack & Pack',
  'Cooking & Food',
  'Clothing',
  'Safety & Navigation',
  'Hygiene',
  'Electronics',
  'Miscellaneous',
]

const gearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  weight: z.number().min(0, 'Weight must be positive'),
  notes: z.string().max(500).optional(),
  isEssential: z.boolean(),
  ownershipStatus: z.enum(['owned', 'borrowed', 'need-to-buy']),
})

type GearFormData = z.infer<typeof gearSchema>

interface GearFormProps {
  initialData?: GearFormData & { id?: string }
  onSubmit: (data: GearFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function GearForm({ initialData, onSubmit, onCancel, isLoading }: GearFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GearFormData>({
    resolver: zodResolver(gearSchema),
    defaultValues: initialData || {
      name: '',
      category: '',
      weight: 0,
      notes: '',
      isEssential: false,
      ownershipStatus: 'owned',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Item Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Ultralight Tent"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          {...register('category')}
          id="category"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a category</option>
          {gearCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
          Weight (grams) *
        </label>
        <input
          {...register('weight', { valueAsNumber: true })}
          type="number"
          id="weight"
          min="0"
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., 900"
        />
        {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>}
      </div>

      {/* Ownership Status */}
      <div>
        <label htmlFor="ownershipStatus" className="block text-sm font-medium text-gray-700 mb-1">
          Ownership Status *
        </label>
        <select
          {...register('ownershipStatus')}
          id="ownershipStatus"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="owned">Owned</option>
          <option value="borrowed">Borrowed</option>
          <option value="need-to-buy">Need to Buy</option>
        </select>
        {errors.ownershipStatus && (
          <p className="mt-1 text-sm text-red-600">{errors.ownershipStatus.message}</p>
        )}
      </div>

      {/* Essential Checkbox */}
      <div className="flex items-center">
        <input
          {...register('isEssential')}
          type="checkbox"
          id="isEssential"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isEssential" className="ml-2 block text-sm text-gray-700">
          Mark as essential item
        </label>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Add any additional notes about this item..."
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Gear' : 'Add Gear'}
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
