import { ImageResponse } from "next/og"

/** Ikona aplikacji: bajt litery „P” (0101 0000) jako 2 × 4 bity. */
export function generateImageMetadata() {
  return [
    { id: "32", size: { width: 32, height: 32 }, contentType: "image/png" },
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ]
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const size = Number(await id)
  return new ImageResponse(<IkonaBity size={size} />, { width: size, height: size })
}

export function IkonaBity({ size }: { size: number }) {
  const bits = "01010000"
  const cell = Math.round(size * 0.15)
  const gap = Math.max(1, Math.round(size * 0.045))
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0e1311",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", width: cell * 4 + gap * 3, gap }}>
        {bits.split("").map((b, i) => (
          <div
            key={i}
            style={{
              width: cell,
              height: cell,
              background: b === "1" ? "#4fe38a" : "#e8ece9",
              opacity: b === "1" ? 1 : 0.85,
            }}
          />
        ))}
      </div>
    </div>
  )
}
