import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Snyco Universe — Product Intelligence Agent — Product Intelligence Agent', description: 'Autonomous Project Intelligence Agent' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
