import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"; 
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "A-Level Mathematics",
  description: "Interactive learning platform for A-Level Mathematics",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

