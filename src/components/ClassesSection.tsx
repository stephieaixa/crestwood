'use client'

import { useState } from 'react'
import { ClassData, weekRangeLabel } from '@/lib/sessions'
import ClassCard from './ClassCard'
import RegistrationModal from './RegistrationModal'

interface Props {
  weeklyClasses: ClassData[][]
  initialWeek: number
}

export default function ClassesSection({ weeklyClasses, initialWeek }: Props) {
  const [weekIndex, setWeekIndex] = useState(initialWeek)
  const [selected, setSelected] = useState<ClassData | null>(null)

  const currentWeek = weeklyClasses[weekIndex] ?? []
  const weekLabel = weekRangeLabel(currentWeek.map(c => c.dateStr))

  return (
    <>
      <section className="px-4 sm:px-6 py-8 lg:pt-0 w-full">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setWeekIndex(i => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B4D1B] hover:text-[#1B4D1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous week"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Week</p>
            <p className="text-sm font-bold text-[#1B4D1B]">{weekLabel}</p>
          </div>
          <button
            onClick={() => setWeekIndex(i => Math.min(weeklyClasses.length - 1, i + 1))}
            disabled={weekIndex === weeklyClasses.length - 1}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1B4D1B] hover:text-[#1B4D1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next week"
          >
            →
          </button>
        </div>

        {currentWeek.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🗓</p>
            <p className="font-medium">No classes this week.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentWeek.map(c => (
              <ClassCard key={c.dateStr} classData={c} onRegister={setSelected} />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <RegistrationModal
          classData={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
