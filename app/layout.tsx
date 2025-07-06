import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salsas.ch',
  description: 'Die exclusivste Premium-Kollektion scharfer Saucen der Welt',
  generator: '9745 Sevelen',
  /** Color del navegador (barra de direcciones, pestañas, etc.) */
  themeColor: '#3333',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta redundante por si prefieres incluirla manualmente */}
        <meta name="theme-color" content="#3333" />
      </head>
      <body>{children}</body>
    </html>
  )
}
