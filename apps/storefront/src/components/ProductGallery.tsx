"use client"

import Image from "next/image"
import { useState } from "react"

/**
 * Product page gallery: main image with thumbnails, arrows and keyboard
 * navigation. Controls only appear when there is more than one image.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: { id?: string; url: string }[]
  alt: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-4/5 rounded-card bg-surface-sunken" />
  }

  const multiple = images.length > 1
  const step = (delta: number) =>
    setActive((current) => (current + delta + images.length) % images.length)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-4/5 overflow-hidden rounded-card bg-surface-sunken"
        role={multiple ? "group" : undefined}
        aria-roledescription={multiple ? "carousel" : undefined}
        tabIndex={multiple ? 0 : -1}
        onKeyDown={(event) => {
          if (!multiple) return
          if (event.key === "ArrowRight") step(1)
          if (event.key === "ArrowLeft") step(-1)
        }}
      >
        {images.map((image, index) => (
          <Image
            key={image.id ?? image.url}
            src={image.url}
            alt={index === 0 ? alt : ""}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-300 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {multiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-lg text-ink shadow-card transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-lg text-ink shadow-card transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              ›
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-medium text-white">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {multiple && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Image ${index + 1} of ${images.length}`}
              onClick={() => setActive(index)}
              className={`relative size-20 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                index === active
                  ? "border-ink"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
