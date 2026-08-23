import { ButtonLink } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <p className="text-sm font-medium tracking-[0.14em] text-ink-subtle uppercase">
        404
      </p>
      <h1 className="text-display mt-3 text-3xl font-semibold">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-3 text-ink-muted">
        It may have moved, or the link might be out of date.
      </p>
      <ButtonLink href="/products" className="mt-8">
        Browse covers
      </ButtonLink>
    </div>
  )
}
