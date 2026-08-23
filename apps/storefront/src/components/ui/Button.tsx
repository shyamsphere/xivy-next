import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

type Variant = "primary" | "secondary" | "ghost"
type Size = "sm" | "md" | "lg"

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-muted",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-sunken",
  ghost: "text-ink-muted hover:bg-surface-sunken hover:text-ink",
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
}

const styles = (variant: Variant, size: Size, className?: string) =>
  [base, variants[variant], sizes[size], className].filter(Boolean).join(" ")

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}) {
  return (
    <button className={styles(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}) {
  return (
    <Link className={styles(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}
