import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clases de Acrobacia Aerea — Crestwood Camp',
  description: 'Inscribite a las clases de Trapecio y Aereos en Crestwood Camp. Martes y Jueves a las 17hs.',
  openGraph: {
    title: 'Clases de Acrobacia Aerea — Crestwood Camp',
    description: 'Trapecio y Aereos · Martes y Jueves 17hs',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
