import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { BASE_URL } from "@/lib/seo"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "XIVY — Premium mobile cases, made honest",
    template: "%s | XIVY",
  },
  description:
    "Premium mobile cases and accessories in honest materials at honest prices. Free delivery over ₹999 across India.",
  openGraph: {
    type: "website",
    siteName: "XIVY",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className={`${inter.variable} font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {/* Awaited rather than streamed: if the shell streams first, a
            notFound() in the page can no longer set a 404 status. The
            device-catalog data behind it is cached for an hour. */}
        <Header />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
