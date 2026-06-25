'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registerForClass } from '@/app/actions'
import { DISCIPLINES, MAX_PER_DISCIPLINE, ClassData, formatDateLong } from '@/lib/sessions'

interface Props {
  classData: ClassData
  onClose: () => void
}

function InlineCounter({
  label, value, onChange, min = 0, max = 10,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
          disabled={value <= min}
          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#1B4D1B] hover:text-[#1B4D1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >−</button>
        <span className="w-5 text-center font-bold text-sm text-[#1B4D1B]">{value}</span>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
          disabled={value >= max}
          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#1B4D1B] hover:text-[#1B4D1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >+</button>
      </div>
    </div>
  )
}

export default function RegistrationModal({ classData, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Per-discipline counts
  const [counts, setCounts] = useState<Record<string, { adults: number; children: number }>>({
    trapecio: { adults: 1, children: 0 },
    aereos:   { adults: 1, children: 0 },
  })
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')

  const dateFormatted = formatDateLong(classData.dateStr)

  function availableFor(discipline: string): number {
    const occupied = discipline === 'trapecio' ? classData.capacity.trapecio : classData.capacity.aereos
    return (MAX_PER_DISCIPLINE[discipline] ?? 10) - occupied
  }

  function toggleDiscipline(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
    setError('')
  }

  function updateCount(discipline: string, field: 'adults' | 'children', value: number) {
    setCounts(prev => ({ ...prev, [discipline]: { ...prev[discipline], [field]: value } }))
  }

  function handleSubmit() {
    setError('')

    if (selected.length === 0) {
      setError('Please select at least one activity.')
      return
    }
    for (const disc of selected) {
      const { adults, children } = counts[disc]
      if (adults + children === 0) {
        const label = disc === 'trapecio' ? 'Trapeze' : 'Aerial Arts'
        setError(`Please add at least 1 participant for ${label}.`)
        return
      }
    }
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    // Client-side capacity check
    for (const disc of selected) {
      const total = counts[disc].adults + counts[disc].children
      const spots = availableFor(disc)
      if (spots < total) {
        const label = disc === 'trapecio' ? 'Trapeze' : 'Aerial Arts'
        setError(
          spots <= 0
            ? `No spots left in ${label} for this date.`
            : `Only ${spots} spot${spots === 1 ? '' : 's'} left in ${label}.`
        )
        return
      }
    }

    const entries = selected.map(d => ({ discipline: d, ...counts[d] }))

    startTransition(async () => {
      const result = await registerForClass({
        sessionDate: classData.dateStr,
        dayOfWeek: classData.sessionId === 'tue' ? 2 : 4,
        name: name.trim(),
        email: email.trim(),
        entries,
      })
      if (!result.success) { setError(result.error); return }
      router.push(`/confirmacion/${result.token}`)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Registration</p>
            <h2 className="font-bold text-[#1B4D1B] text-lg capitalize leading-tight">{dateFormatted}</h2>
            <p className="text-sm text-gray-500">5:00 PM — 6:00 PM · Crestwood Camp</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-lg font-light"
          >×</button>
        </div>

        <div className="px-6 pb-8 pt-5 space-y-6">
          {/* Activity selection */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-1">
              Which activity?
              <span className="text-xs text-gray-400 font-normal ml-2">You can choose both</span>
            </h3>
            <div className="space-y-2">
              {DISCIPLINES.map(disc => {
                const spots    = availableFor(disc.id)
                const isFull   = spots <= 0
                const isSelected = selected.includes(disc.id)
                const { adults, children } = counts[disc.id]
                const total = adults + children

                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => !isFull && toggleDiscipline(disc.id)}
                    disabled={isFull}
                    className={[
                      'w-full flex flex-col gap-0 p-4 rounded-xl border-2 transition-all text-left',
                      isSelected
                        ? 'border-[#1B4D1B] bg-[#e8f5e8]'
                        : isFull
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-[#1B4D1B] hover:bg-[#f0f9f0] cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{disc.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${isSelected ? 'text-[#1B4D1B]' : 'text-gray-800'}`}>{disc.label}</p>
                        {disc.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{disc.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isFull ? 'Full' : `${spots} spot${spots === 1 ? '' : 's'} available`}
                        </p>
                      </div>
                      <div className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected ? 'border-[#1B4D1B] bg-[#1B4D1B]' : 'border-gray-300',
                      ].join(' ')}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Inline counters when selected */}
                    {isSelected && (
                      <div
                        className="border-t border-[#c8e6c8] pt-3 mt-3 space-y-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-xs font-semibold text-[#1B4D1B] mb-2">Participants</p>
                        <InlineCounter
                          label="Adults" value={adults}
                          onChange={v => updateCount(disc.id, 'adults', v)}
                          min={0} max={spots}
                        />
                        <InlineCounter
                          label="Children" value={children}
                          onChange={v => updateCount(disc.id, 'children', v)}
                          min={0} max={spots}
                        />
                        {total > 0 && (
                          <p className="text-xs text-center text-gray-400 pt-1">
                            Total: <strong className="text-[#1B4D1B]">{total} participant{total > 1 ? 's' : ''}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Personal info */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-3">Your info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Full name</label>
                <input
                  type="text" value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1B4D1B] focus:ring-2 focus:ring-[#1B4D1B]/10 transition-all placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Email</label>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1B4D1B] focus:ring-2 focus:ring-[#1B4D1B]/10 transition-all placeholder-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">We'll send your confirmation and reminder here</p>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button
            type="button" onClick={handleSubmit} disabled={isPending}
            className="w-full bg-[#F5C842] text-[#1B4D1B] font-bold text-base py-4 rounded-xl hover:bg-[#f0bc30] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </span>
            ) : 'Confirm registration →'}
          </button>
        </div>
      </div>
    </div>
  )
}
