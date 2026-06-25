'use client'

import { useState } from 'react'
import { ClassData, weekRangeLabel } from '@/lib/sessions'
import ClassCard from './ClassCard'
import RegistrationModal from './RegistrationModal'

interface Props {
  weeklyClasses: ClassData[][]
  initialWeek: number
}

const HOW_IT_WORKS = [
  { n: '1', t: 'Pick a class', d: 'Choose the day that works best for you.' },
  { n: '2', t: 'Reserve your spot', d: 'Fill out the form with your details.' },
  { n: '3', t: 'Get confirmed', d: "We'll email you all the details and a calendar file to save the date." },
  { n: '4', t: 'Time to fly!', d: "We'll send you a reminder the day before. Just wear comfortable clothes." },
]

function HowItWorks() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-[#1B4D1B] text-base mb-4">How it works</h3>
      <div className="space-y-3">
        {HOW_IT_WORKS.map(step => (
          <div key={step.n} className="flex items-start gap-3">
            <div
              style={{ background: 'var(--green)', color: 'var(--gold)' }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
            >
              {step.n}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{step.t}</p>
              <p className="text-xs text-gray-500 mt-0.5">{step.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WeeklyLayout({ weeklyClasses, initialWeek }: Props) {
  const [weekIndex, setWeekIndex] = useState(initialWeek)
  const [selected, setSelected] = useState<ClassData | null>(null)

  const currentWeek = weeklyClasses[weekIndex] ?? []
  const weekLabel = weekRangeLabel(currentWeek.map(c => c.dateStr))

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-10 sm:px-14 lg:px-16 pt-8 pb-10">

        {/* Week navigation — arrows sit outside the content columns */}
        <div className="relative flex items-center justify-center mb-6">
          <button
            onClick={() => setWeekIndex(i => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
            aria-label="Previous week"
            className="absolute -left-2 sm:left-0 w-10 h-10 rounded-full bg-[#1B4D1B] text-white flex items-center justify-center shadow-md disabled:opacity-25 hover:bg-[#2a5f2a] transition-all text-base"
          >
            ←
          </button>

          <div className="text-center px-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Week</p>
            <p className="text-sm font-bold text-[#1B4D1B]">{weekLabel}</p>
          </div>

          <button
            onClick={() => setWeekIndex(i => Math.min(weeklyClasses.length - 1, i + 1))}
            disabled={weekIndex === weeklyClasses.length - 1}
            aria-label="Next week"
            className="absolute -right-2 sm:right-0 w-10 h-10 rounded-full bg-[#1B4D1B] text-white flex items-center justify-center shadow-md disabled:opacity-25 hover:bg-[#2a5f2a] transition-all text-base"
          >
            →
          </button>
        </div>

        {/* Two-column on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">

          {/* How it works — left on desktop, below cards on mobile */}
          <aside className="order-2 lg:order-1 mt-6 lg:mt-0 lg:w-60 lg:flex-shrink-0 lg:sticky lg:top-6">
            <HowItWorks />
          </aside>

          {/* Class cards — right on desktop, first on mobile */}
          <div className="order-1 lg:order-2 lg:flex-1 lg:min-w-0">
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
          </div>

        </div>
      </div>

      {selected && (
        <RegistrationModal classData={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
