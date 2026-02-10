'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CategoryWeight {
  category: string
  weight: number
  count: number
}

interface CategoryWeightPieChartProps {
  categoryWeights: CategoryWeight[]
  formatWeight: (weight: number) => string
}

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#14B8A6', // teal-500
  '#A855F7', // purple-500
]

export default function CategoryWeightPieChart({
  categoryWeights,
  formatWeight,
}: CategoryWeightPieChartProps) {
  if (categoryWeights.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
    )
  }

  const data = {
    labels: categoryWeights.map((cw) => cw.category),
    datasets: [
      {
        data: categoryWeights.map((cw) => cw.weight),
        backgroundColor: categoryWeights.map((_, idx) => COLORS[idx % COLORS.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; parsed: number; dataset: { data: number[] } }) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatWeight(value)} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-md">
        <Pie data={data} options={options} />
      </div>
    </div>
  )
}
