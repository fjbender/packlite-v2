// Utility functions for weight conversions

export function gramsToOunces(grams: number): number {
  return grams * 0.035274
}

export function gramsToPounds(grams: number): number {
  return grams * 0.00220462
}

export function ouncesToGrams(ounces: number): number {
  return ounces * 28.3495
}

export function poundsToGrams(pounds: number): number {
  return pounds * 453.592
}

export function formatWeight(grams: number, unit: 'grams' | 'ounces' | 'pounds' = 'grams'): string {
  switch (unit) {
    case 'ounces':
      return `${gramsToOunces(grams).toFixed(2)} oz`
    case 'pounds':
      return `${gramsToPounds(grams).toFixed(2)} lbs`
    case 'grams':
    default:
      return `${grams.toFixed(0)} g`
  }
}
