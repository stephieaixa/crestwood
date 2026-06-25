'use client'

import { useState } from 'react'
import { ClassData } from '@/lib/sessions'
import ClassCard from './ClassCard'
import RegistrationModal from './RegistrationModal'

interface Props {
  classes: ClassData[]
}

export default function ClassesSection({ classes }: Props) {
  const [selected, setSelected] = useState<ClassData | null>(null)

  return (
    <>
      <section className="px-4 sm:px-6 py-10 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-bold text-[#1B4D1B] mb-6">Proximas clases</h2>
        {classes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🗓</p>
            <p className="font-medium">No hay clases programadas proximas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(c => (
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
