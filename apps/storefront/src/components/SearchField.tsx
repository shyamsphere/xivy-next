"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// Deliberately no useSearchParams: this renders in the root layout, and
// reading search params here forces a client-side bailout that blocks static
// prerendering of every page. The shop page echoes the active query instead.
export function SearchField({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [value, setValue] = useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const query = value.trim()
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products")
  }

  return (
    <form role="search" onSubmit={submit} className={className}>
      <label className="sr-only" htmlFor="site-search">
        Search products
      </label>
      <div className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-3 focus-within:border-ink">
        <SearchIcon />
        <input
          id="site-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search covers"
          className="w-32 bg-transparent text-sm outline-none placeholder:text-ink-subtle lg:w-44"
        />
      </div>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-ink-subtle"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="M16 16l4 4" />
    </svg>
  )
}
