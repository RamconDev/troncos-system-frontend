import * as React from "react"
import { Boxes, PackageCheck } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

export function MonthlyProductsSoldChart({ series = [] }) {
  const gradientId = React.useId()
  const [hoveredIdx, setHoveredIdx] = React.useState(null)

  const width = 560
  const height = 210
  const padX = 36
  const padTop = 28
  const padBottom = 34

  const normalizedSeries = React.useMemo(() => {
    return series.map((s) => ({
      ...s,
      garmentsCount: Number(s.garments_count ?? s.garmentsCount ?? 0),
      ordersCount: Number(s.orders_count ?? s.ordersCount ?? 0),
      activeGarmentsCount: Number(
        s.active_garments_count ?? s.activeGarmentsCount ?? 0
      ),
      fullLabel: s.full_label ?? s.fullLabel ?? s.label,
    }))
  }, [series])

  const maxGarments = Math.max(
    ...normalizedSeries.map((s) => s.garmentsCount),
    1
  )
  const plotW = width - padX * 2
  const plotH = height - padTop - padBottom

  const points = normalizedSeries.map((item, idx) => {
    const x =
      normalizedSeries.length > 1
        ? padX + (idx / (normalizedSeries.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.garmentsCount / maxGarments) * plotH
    return { x, y, ...item }
  })

  const linePath = buildSmoothCurve(points)
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padBottom} L ${points[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  const totalGarments = normalizedSeries.reduce(
    (sum, s) => sum + s.garmentsCount,
    0
  )
  const totalOrders = normalizedSeries.reduce((sum, s) => sum + s.ordersCount, 0)

  const activeItem =
    hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < normalizedSeries.length
      ? normalizedSeries[hoveredIdx]
      : null

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Prendas y Pedidos por Mes</span>
          </CardTitle>
          <CardDescription>
            Volumen de prendas demandadas y cantidad de pedidos generados.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Prendas Totales:</span>
            <strong className="font-mono text-blue-600 dark:text-blue-400">
              {totalGarments} uds
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Pedidos:</span>
            <strong className="font-mono text-purple-600 dark:text-purple-400">
              {totalOrders}
            </strong>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6">
        {series.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
            No hay registros de prendas en este período.
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guías horizontales */}
              {[0, 0.5, 1].map((ratio) => {
                const y = padTop + plotH * (1 - ratio)
                const val = Math.round(maxGarments * ratio)
                return (
                  <g key={ratio}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={width - padX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-muted-foreground text-[10px] font-mono"
                    >
                      {val}u
                    </text>
                  </g>
                )
              })}

              {/* Área y línea */}
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

              {/* Puntos y etiquetas */}
              {points.map((pt, idx) => {
                const isHovered = hoveredIdx === idx

                return (
                  <g
                    key={pt.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={padTop}
                        x2={pt.x}
                        y2={height - padBottom}
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeDasharray="2 2"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5.5 : 3.5}
                      className="fill-background stroke-blue-600 transition-all"
                      strokeWidth={isHovered ? "3" : "2"}
                    />

                    <text
                      x={pt.x}
                      y={height - padBottom + 16}
                      textAnchor="middle"
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered
                          ? "fill-foreground font-bold"
                          : "fill-muted-foreground"
                      }`}
                    >
                      {pt.label}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Tooltip dinámico sobre el mes seleccionado */}
            {activeItem && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                <span className="font-semibold text-foreground">
                  📅 {activeItem.fullLabel}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Prendas Totales:{" "}
                    <strong className="text-blue-600 dark:text-blue-400 font-mono">
                      {activeItem.garmentsCount} uds
                    </strong>
                  </span>
                  <span>
                    Activas en Lote:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {activeItem.activeGarmentsCount} uds
                    </strong>
                  </span>
                  <span>
                    Pedidos creados:{" "}
                    <strong className="text-foreground font-mono">
                      {activeItem.ordersCount}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

