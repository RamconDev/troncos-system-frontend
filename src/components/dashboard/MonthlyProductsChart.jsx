import * as React from "react"
import { Boxes } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatUsd } from "@/components/orders/order-constants"

function buildSmoothCurve(points) {
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

export function MonthlyProductsChart({ series = [] }) {
  const gradientId = React.useId()
  const width = 480
  const height = 160
  const padX = 28
  const padTop = 24
  const padBottom = 28

  const maxGarments = Math.max(...series.map((s) => s.garments), 1)
  const plotW = width - padX * 2
  const plotH = height - padTop - padBottom

  const points = series.map((item, idx) => {
    const x =
      series.length > 1
        ? padX + (idx / (series.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.garments / maxGarments) * plotH
    return { x, y, ...item }
  })

  const linePath = buildSmoothCurve(points)
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padBottom} L ${points[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  const totalGarmentsPeriod = series.reduce((sum, s) => sum + s.garments, 0)

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base">
            Prendas / Productos Pedidos por Mes
          </CardTitle>
          <CardDescription>
            Evolución mensual de unidades solicitadas en los últimos 6 meses ({totalGarmentsPeriod} prendas en el periodo).
          </CardDescription>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
          <Boxes className="size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-2">
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-40 overflow-visible"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Línea base */}
            <line
              x1={padX}
              y1={height - padBottom}
              x2={width - padX}
              y2={height - padBottom}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />

            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {points.map((pt) => (
              <g key={pt.key}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  className="fill-background stroke-blue-500"
                  strokeWidth="2.5"
                />
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold"
                >
                  {pt.garments}
                </text>
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Desglose rápido por mes */}
        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs sm:grid-cols-6">
          {series.map((item) => (
            <div key={item.key} className="rounded bg-muted/30 px-2 py-1.5">
              <span className="block text-[10px] text-muted-foreground">
                {item.label}
              </span>
              <strong className="font-semibold">{item.garments} uds</strong>
              <span className="block text-[10px] text-muted-foreground">
                {formatUsd(item.saleUsd)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

