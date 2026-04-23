import { Metadata } from "next"
import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google"

import "./globals.css"
import "katex/dist/katex.min.css"
import { ConvexClientProvider } from "@/components/convex-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { getToken } from "@/lib/auth-server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "xai",
  description: "XAI Chat Application",
}

const robotoSlabHeading = Roboto_Slab({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const token = await getToken()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased overflow-x-hidden", fontMono.variable, "font-sans", geist.variable, robotoSlabHeading.variable)}
    >
      <body className="overflow-x-hidden">
        <ConvexClientProvider initialToken={token}>
          <ThemeProvider>{children}</ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
