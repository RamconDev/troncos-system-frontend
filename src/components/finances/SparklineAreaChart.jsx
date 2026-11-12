import * as React from "react"

/**
 * Construye un path SVG con curva cúbica suavizada (Catmull-Rom / Bezier)
 */
function buildSmoothPath(points) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return path
}

export function SparklineAreaChart({
  data = [],
  color = "#10b981",
  height = 44,
}) {
  const gradientId = React.useId()
  const width = 240
  const padY = 4

  const series = data.length >= 2 ? data : [0, ...(data.length === 1 ? data : [0])]
  const minVal = Math.min(...series)
  const maxVal = Math.max(...series)
  const range = maxVal - minVal || 1

  const points = series.map((val, idx) => {
    const x = (idx / (series.length - 1)) * width
    const normalized = (val - minVal) / range
    const y = height - padY - normalized * (height - padY * 2)
    return { x, y }
  })

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-11 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

