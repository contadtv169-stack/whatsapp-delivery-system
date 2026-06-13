import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "WhatsApp Delivery",
  description: "Sistema de delivery com WhatsApp, IA e ElevenLabs",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Delivery" },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#FF6B35",
  icons: {
    apple: "/icon-192.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen pb-safe">{children}</body>
    </html>
  )
}
