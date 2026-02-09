# Pantry Feature - Complete Implementation

## Overview

The Pantry feature allows users to manage their food inventory with multi-category support, weight tracking, and calorie information. Food items can be assigned to multiple meal categories (breakfast, lunch, dinner, snacks), making them flexible for trip meal planning.

## 🎯 Key Features

### Food Management

- ✅ Create, read, update, delete food items
- ✅ Multi-category support (one item can be breakfast AND snack)
- ✅ Weight per unit tracking
- ✅ Calories per 100g with auto-calculation per unit
- ✅ Optional descriptions
- ✅ Category filtering

### Data Model

```typescript
{
  name: string                    // "Instant Oatmeal"
  categories: string[]            // ['breakfast', 'snacks']
  weightPerUnit: number           // 50 (grams)
  caloriesPer100g: number         // 380
  description?: string            // Optional notes
}
```

### Calculations

- **Calories per unit** = (weightPerUnit / 100) × caloriesPer100g
- Example: 50g packet with 380 cal/100g = 190 calories

## 📁 Files Created (8 files)

### Backend (3 files)

1. **`src/lib/models/food.ts`** - Food model
   - findByUserId() - Get all food for user
   - findByCategory() - Filter by meal category
   - findById() - Get single item
   - create() - Add new food
   - updateById() - Update food
   - deleteById() - Delete food
   - countByUserId() - Count items

2. **`src/app/api/food/route.ts`**
   - GET /api/food - List all food (with optional category filter)
   - POST /api/food - Create new food item

3. **`src/app/api/food/[id]/route.ts`**
   - GET /api/food/[id] - Get single food item
   - PUT /api/food/[id] - Update food item
   - DELETE /api/food/[id] - Delete food item

### Frontend (5 files)

4. **`src/features/pantry/components/food-form.tsx`**
   - Reusable form for add/edit
   - Multi-select category buttons
   - Weight and calorie inputs
   - Validation with Zod
   - Toggle categories with visual feedback

5. **`src/features/pantry/components/food-list.tsx`**
   - Display food grouped by category
   - Shows weight and calculated calories
   - Category badges
   - Edit and delete actions
   - Empty state with CTA

6. **`src/app/pantry/page.tsx`**
   - Main pantry list page
   - Category filter buttons
   - Grid layout for food cards

7. **`src/app/pantry/new/page.tsx`**
   - Add new food form
   - Redirects to pantry on success

8. **`src/app/pantry/[id]/edit/page.tsx`**
   - Edit existing food item
   - Pre-fills form with current data

### Updated

9. **`src/components/organisms/header.tsx`**
   - Added "Pantry" navigation link

## 🎨 UI Highlights

### Form Design

```
┌─────────────────────────────────────────────┐
│ Food Name *                                 │
│ [Instant Oatmeal........................] │
│                                             │
│ Meal Categories *                           │
│ [Breakfast✓] [Lunch] [Dinner] [Snacks✓]   │
│                                             │
│ Weight per Unit (g) | Calories per 100g    │
│ [50...............]  | [380..............] │
│                                             │
│ Description                                 │
│ [Optional notes........................]  │
│                                             │
│ [Save]  [Cancel]                            │
└─────────────────────────────────────────────┘
```

### List View (Grouped by Category)

```
Breakfast
┌───────────────────┐ ┌───────────────────┐
│ Instant Oatmeal   │ │ Energy Bar        │
│ 🏷️ breakfast snacks│ │ 🏷️ breakfast snacks│
│ 50g | 190 cal     │ │ 45g | 200 cal     │
└───────────────────┘ └───────────────────┘

Lunch
┌───────────────────┐ ┌───────────────────┐
│ Trail Mix         │ │ Jerky             │
│ 🏷️ lunch snacks    │ │ 🏷️ lunch dinner    │
│ 100g | 450 cal    │ │ 30g | 90 cal      │
└───────────────────┘ └───────────────────┘
```

## 🔑 Key Implementation Details

### Multi-Category Toggle

```typescript
const toggleCategory = (category) => {
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
```

### Category Filtering

```typescript
// API supports optional category filter
GET /api/food?category=breakfast

// In FoodModel
static async findByCategory(userId, category) {
  return db.collection('food')
    .find({ userId, categories: category })
    .toArray()
}
```

### Calorie Calculation

```typescript
function calculateCalories(weightPerUnit, caloriesPer100g) {
  return Math.round((weightPerUnit / 100) * caloriesPer100g)
}
```

## 🧪 Testing Scenarios

### Basic CRUD

- [x] Add new food item with single category
- [x] Add food item with multiple categories
- [x] Edit food item (change categories)
- [x] Delete food item
- [x] View all food items

### Category Filtering

- [x] Filter by breakfast (shows items with breakfast tag)
- [x] Filter by lunch
- [x] Filter by dinner
- [x] Filter by snacks
- [x] View all categories

### Edge Cases

- [x] Food with no categories (validation prevents)
- [x] Food with all 4 categories (works correctly)
- [x] Very high calorie values
- [x] Fractional weight values

## 📊 Example Data

```json
{
  "name": "Instant Oatmeal",
  "categories": ["breakfast", "snacks"],
  "weightPerUnit": 50,
  "caloriesPer100g": 380,
  "description": "Quick-cook oatmeal, add hot water"
}

{
  "name": "Energy Bar",
  "categories": ["breakfast", "lunch", "snacks"],
  "weightPerUnit": 45,
  "caloriesPer100g": 450,
  "description": "Chocolate chip flavor"
}

{
  "name": "Beef Jerky",
  "categories": ["lunch", "dinner", "snacks"],
  "weightPerUnit": 30,
  "caloriesPer100g": 300,
  "description": "High protein, teriyaki"
}
```

## 🚀 What's Next: Trip Meal Planning

Now that we have Pantry, the next step is connecting food to trips:

### Trip Meal Planning Features

1. **Extend Trip Model**
   - Add `mealPlan` array to trips
   - Structure: `{ day, mealType, foodId, quantity }`

2. **Trip Meal API**
   - POST /api/trips/[id]/meals - Add food to day/meal
   - DELETE /api/trips/[id]/meals - Remove food
   - Update meal quantities

3. **Trip Meal Planning UI**
   - Day-by-day meal planner
   - Drag-drop or click-to-add from pantry
   - Show daily calories and weight
   - Meal type organization (breakfast, lunch, dinner, snacks)
   - Quantity selector per item

4. **Calculations**
   - Daily calorie totals
   - Daily weight totals
   - Per-meal breakdowns
   - Trip total food weight

### Example Trip Meal Structure

```typescript
{
  tripId: "abc123",
  mealPlan: [
    { day: 1, mealType: "breakfast", foodId: "oatmeal1", quantity: 2 },
    { day: 1, mealType: "lunch", foodId: "bar1", quantity: 1 },
    { day: 1, mealType: "dinner", foodId: "pasta1", quantity: 1 },
    { day: 1, mealType: "snacks", foodId: "jerky1", quantity: 1 },
    { day: 2, mealType: "breakfast", foodId: "oatmeal1", quantity: 2 },
    // ...
  ]
}
```

### UI Mockup for Trip Meals

```
Trip: Weekend Mountain Hike
June 15-17, 2026

┌─────────────────────────────────────────────┐
│ Day 1 - June 15                             │
├─────────────────────────────────────────────┤
│ Breakfast                       [+ Add]     │
│  • Oatmeal x2        100g    380 cal        │
│                                              │
│ Lunch                           [+ Add]     │
│  • Energy Bar x1      45g    200 cal        │
│  • Trail Mix x1      100g    450 cal        │
│                                              │
│ Dinner                          [+ Add]     │
│  • Pasta Meal x1     150g    600 cal        │
│                                              │
│ Snacks                          [+ Add]     │
│  • Jerky x1           30g     90 cal        │
│                                              │
│ Day Total:           425g    1720 cal       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Day 2 - June 16                             │
│ ...                                         │
└─────────────────────────────────────────────┘

Trip Total Food: 850g | 3440 cal
```

## ✅ Completeness

**Backend**: 100% ✅

- Food model complete
- All CRUD operations
- Category filtering
- Full authentication

**Frontend**: 100% ✅

- All pages functional
- Multi-category selection
- Category filtering
- Responsive design
- Loading/empty states

**Testing**: Ready ✅

- All flows work
- Edge cases covered
- Calculations correct

## 🐛 Known Issues

None! Feature is production-ready.

## 📝 Notes

- Food categories are flexible (any combo of 4 meal types)
- Calories calculated automatically from weight + per-100g value
- Weight stored in grams for consistency with gear
- All operations require authentication
- Users can only see/edit their own food

---

**Status**: ✅ Complete and Production-Ready  
**Date**: February 5, 2026  
**Files**: 8 new files + 1 updated  
**Next**: Trip meal planning integration
