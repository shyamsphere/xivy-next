"use client"

import Image from "next/image"
import { useState } from "react"

export type CardImage = { id?: string; url: string }

/**
 * Product-card imagery.
 *
 * With one image it simply renders it — the previous version cross-faded to a
 * second image that did not exist, so hovering blanked the card. With more
 * than one it becomes a swipeable strip with dots and arrows, and hover
 * previews the next shot.
 */
export function CardImages({
  images,
  alt,
  priority = false,
}: {
  images: CardImage[]
  alt: string
  priority?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [hovering, setHovering] = useState(false)

  if (images.length === 0) {
    return <div className="aspect-4/5 bg-surface-sunken" />
  }

  const multiple = images.length > 1
  // Hover peeks at the next image, but only when there is one to peek at.
  const shown = multiple && hovering && index === 0 ? 1 : index

  const go = (next: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIndex((next + images.length) % images.length)
  }

  return (
    <div
      className="relative aspect-4/5 overflow-hidden bg-surface-sunken"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {images.map((image, i) => (
        <Image
          key={image.id ?? image.url}
          src={image.url}
          alt={i === 0 ? alt : ""}
          fill
          priority={priority && i === 0}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${
            i === shown ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => go(index - 1, e)}
            className="absolute top-1/2 left-2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-ink opacity-0 shadow-card transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => go(index + 1, e)}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-ink opacity-0 shadow-card transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((image, i) => (
              <button
                key={image.id ?? image.url}
                type="button"
                aria-label={`Image ${i + 1} of ${images.length}`}
                aria-current={i === shown}
                onClick={(e) => go(i, e)}
                className={`size-1.5 rounded-full transition-colors ${
                  i === shown ? "bg-ink" : "bg-ink/25 hover:bg-ink/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
