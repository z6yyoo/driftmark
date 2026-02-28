import type { Metadata } from "next"
import localFont from "next/font/local"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Driftmark - News-Linked Prediction Market Tracker",
  description:
    "Educational research tool linking live news to prediction market price changes across Polymarket, Kalshi, and Opinion",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
