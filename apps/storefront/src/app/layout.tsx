import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "XIVY — Premium Mobile Cases & Accessories",
    template: "%s | XIVY",
  },
  description:
    "Premium mobile cases and accessories. Honest prices, delivered across India.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-neutral-900`}>
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-xl font-bold tracking-tight">
              XIVY
            </Link>
            <nav className="flex items-center gap-6 text-sm text-neutral-600">
              <Link href="/products" className="hover:text-neutral-900">
                Shop
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[70vh]">{children}</main>
        <footer className="border-t border-neutral-200 py-10">
          <div className="mx-auto max-w-7xl px-4 text-sm text-neutral-500 sm:px-6">
            <p>© {new Date().getFullYear()} ShyamSphere International · Mumbai, India</p>
            <p className="mt-1">support@xivy.in</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
