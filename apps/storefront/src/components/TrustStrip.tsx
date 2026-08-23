const POINTS = [
  { title: "Free delivery over ₹999", detail: "Flat ₹49 below that" },
  { title: "Cash on delivery", detail: "Pay when it arrives" },
  { title: "Ships across India", detail: "Dispatched from Mumbai" },
  { title: "Premium materials", detail: "Tested for real drops" },
]

export function TrustStrip() {
  return (
    <section
      aria-label="Why shop with XIVY"
      className="border-y border-line bg-surface-sunken"
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {POINTS.map((point) => (
          <li key={point.title}>
            <p className="text-sm font-medium text-ink">{point.title}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{point.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
