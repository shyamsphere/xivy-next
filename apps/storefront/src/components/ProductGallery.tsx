"use client"

import Image from "next/image"
import { useState } from "react"

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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-card bg-surface-sunken">
        <Image
          src={images[active].url}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Image ${index + 1} of ${images.length}`}
              onClick={() => setActive(index)}
              className={`relative size-20 overflow-hidden rounded-lg border transition-colors ${
                index === active ? "border-ink" : "border-line hover:border-line-strong"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
