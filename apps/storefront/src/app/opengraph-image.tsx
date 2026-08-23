import { ImageResponse } from "next/og"

export const alt = "XIVY — premium mobile cases"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Default social card. Product pages override this with their own image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, color: "#0b0b0c" }}>
          XIVY
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "#0b0b0c",
            maxWidth: 900,
          }}
        >
          Protection that doesn&apos;t hide your phone.
        </div>
        <div style={{ fontSize: 30, color: "#52525b" }}>
          Premium cases · Free delivery over ₹999 · India
        </div>
      </div>
    ),
    size
  )
}
