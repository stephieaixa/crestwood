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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full">
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

const btnBase =
  'w-11 h-11 rounded-full bg-[#1B4D1B] text-white flex items-center justify-center shadow-md disabled:opacity-25 hover:bg-[#2a5f2a] transition-all text-base'

export default function WeeklyLayout({ weeklyClasses, initialWeek }: Props) {
  const [weekIndex, setWeekIndex] = useState(initialWeek)
  const [selected, setSelected] = useState<ClassData | null>(null)

  const currentWeek = weeklyClasses[weekIndex] ?? []
  const weekLabel = weekRangeLabel(currentWeek.map(c => c.dateStr))

  const prev = () => setWeekIndex(i => Math.max(0, i - 1))
  const next = () => setWeekIndex(i => Math.min(weeklyClasses.length - 1, i + 1))

  return (
    <>
      <div className="w-full max-w-6xl mx-auto pt-8 pb-10">

        {/* Week nav — arrows stay at far edges, label centered over cards column */}
        <div className="relative flex items-center px-4 sm:px-6 lg:px-8 mb-6">
          <button onClick={prev} disabled={weekIndex === 0} aria-label="Previous week"
            className={`absolute left-4 ${btnBase}`}>←</button>
          {/* Spacer = How it works width (w-64) + column gap (mr-10) → aligns label with cards */}
          <div className="hidden lg:block lg:flex-shrink-0 lg:w-64 lg:mr-10" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Week</p>
            <p className="text-sm font-bold text-[#1B4D1B]">{weekLabel}</p>
          </div>
          <button onClick={next} disabled={weekIndex === weeklyClasses.length - 1} aria-label="Next week"
            className={`absolute right-4 ${btnBase}`}>→</button>
        </div>

        {/* Content area */}
        <div className="px-4 sm:px-6 lg:px-8">

          {/* Two-column on desktop, stacked on mobile */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-10">

            {/* How it works — left on desktop, below cards on mobile */}
            <aside className="order-2 lg:order-1 mt-6 lg:mt-0 lg:w-64 lg:flex-shrink-0">
              <div className="h-full">
                <HowItWorks />
              </div>
            </aside>

            {/* Class cards — right on desktop, first on mobile */}
            <div className="order-1 lg:order-2 lg:flex-1 lg:min-w-0">
              {currentWeek.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">🗓</p>
                  <p className="font-medium">No classes this week.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch h-full">
                  {currentWeek.map(c => (
                    <ClassCard key={c.dateStr} classData={c} onRegister={setSelected} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {selected && (
        <RegistrationModal classData={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
