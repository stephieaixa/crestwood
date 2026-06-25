import { ClassData, MAX_PER_DISCIPLINE, formatDateLong, formatDateShort, MAPS_URL } from '@/lib/sessions'

interface Props {
  classData: ClassData
  onRegister: (data: ClassData) => void
}

function CapacityBar({ occupied, max }: { occupied: number; max: number }) {
  const pct = Math.min((occupied / max) * 100, 100)
  const remaining = max - occupied
  const color = remaining <= 2 ? '#ef4444' : remaining <= 5 ? '#f97316' : '#1B4D1B'

  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full capacity-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs" style={{ color }}>
        {remaining <= 0 ? 'Full' : `${remaining} spot${remaining === 1 ? '' : 's'} left`}
      </p>
    </div>
  )
}

export default function ClassCard({ classData, onRegister }: Props) {
  const { sessionLabel, dateStr, startTime, capacity } = classData
  const dateFormatted = formatDateLong(dateStr)
  const dateShort = formatDateShort(dateStr)
  const isFull = capacity.trapecio >= MAX_PER_DISCIPLINE['trapecio'] && capacity.aereos >= MAX_PER_DISCIPLINE['aereos']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Card header */}
      <div className="bg-[#1B4D1B] px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <p className="text-[#F5C842] text-xs font-semibold uppercase tracking-widest">{sessionLabel}</p>
          <h3 className="text-white text-2xl font-bold mt-0.5 capitalize">{dateShort}</h3>
          <p className="text-green-300 text-sm mt-1 whitespace-nowrap">{startTime} — {endTime(startTime, classData.durationMinutes)}</p>
        </div>
        <div className="text-right">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 text-xs hover:text-[#F5C842] transition-colors whitespace-nowrap"
          >
            📍 Crestwood Camp
          </a>
        </div>
      </div>

      {/* Capacity section */}
      <div className="px-5 py-4 space-y-3 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎪</span>
            <span className="text-sm font-semibold text-gray-700">Trapeze</span>
          </div>
          <CapacityBar occupied={capacity.trapecio} max={MAX_PER_DISCIPLINE['trapecio']} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🌀</span>
            <span className="text-sm font-semibold text-gray-700">Aerial Arts</span>
          </div>
          <CapacityBar occupied={capacity.aereos} max={MAX_PER_DISCIPLINE['aereos']} />
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 mt-auto">
        <button
          onClick={() => onRegister(classData)}
          disabled={isFull}
          className={[
            'w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]',
            isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#F5C842] text-[#1B4D1B] hover:bg-[#f0bc30] shadow-sm',
          ].join(' ')}
        >
          {isFull ? 'Class full' : 'Sign me up →'}
        </button>
      </div>
    </div>
  )
}

function endTime(start: string, duration: number): string {
  const [h, m] = start.split(':').map(Number)
  const total = h * 60 + m + duration
  const eh = Math.floor(total / 60)
  const em = total % 60
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`
}
