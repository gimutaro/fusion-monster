import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fusion Monsters',
  description: 'Generate and fuse monsters to create the strongest chimera!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
