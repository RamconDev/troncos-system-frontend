import * as React from "react"
import { DollarSign, ArrowUpDown } from "lucide-react"
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

export function MonthlyFinancialsChart({ series = [] }) {
  const salesGradId = React.useId()
  const expGradId = React.useId()
  const [hoveredIdx, setHoveredIdx] = React.useState(null)

  const width = 560
  const height = 210
  const padX = 36
  const padTop = 28
  const padBottom = 34

  const normalizedSeries = React.useMemo(() => {
    return series.map((s) => ({
      ...s,
      grossSalesUsd: Number(s.gross_sales_usd ?? s.grossSalesUsd ?? 0),
      expensesUsd: Number(s.expenses_usd ?? s.expensesUsd ?? 0),
      netMarginUsd: Number(
        s.net_margin_usd ??
          s.netMarginUsd ??
          ((s.gross_sales_usd ?? s.grossSalesUsd ?? 0) -
            (s.expenses_usd ?? s.expensesUsd ?? 0))
      ),
      fullLabel: s.full_label ?? s.fullLabel ?? s.label,
    }))
  }, [series])

  const maxAmount = Math.max(
    ...normalizedSeries.flatMap((s) => [s.grossSalesUsd, s.expensesUsd]),
    1
  )
  const plotW = width - padX * 2
  const plotH = height - padTop - padBottom

  const salesPoints = normalizedSeries.map((item, idx) => {
    const x =
      normalizedSeries.length > 1
        ? padX + (idx / (normalizedSeries.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.grossSalesUsd / maxAmount) * plotH
    return { x, y, ...item }
  })

  const expensePoints = normalizedSeries.map((item, idx) => {
    const x =
      normalizedSeries.length > 1
        ? padX + (idx / (normalizedSeries.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.expensesUsd / maxAmount) * plotH
    return { x, y, ...item }
  })

  const salesLinePath = buildSmoothCurve(salesPoints)
  const salesAreaPath =
    salesPoints.length > 0
      ? `${salesLinePath} L ${salesPoints[salesPoints.length - 1].x.toFixed(1)} ${height - padBottom} L ${salesPoints[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  const expLinePath = buildSmoothCurve(expensePoints)
  const expAreaPath =
    expensePoints.length > 0
      ? `${expLinePath} L ${expensePoints[expensePoints.length - 1].x.toFixed(1)} ${height - padBottom} L ${expensePoints[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  const totalGross = normalizedSeries.reduce((sum, s) => sum + s.grossSalesUsd, 0)
  const totalExp = normalizedSeries.reduce((sum, s) => sum + s.expensesUsd, 0)
  const netMargin = totalGross - totalExp

  const activeItem =
    hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < normalizedSeries.length
      ? normalizedSeries[hoveredIdx]
      : null

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ventas Brutas vs Gastos por Mes</span>
          </CardTitle>
          <CardDescription>
            Facturación bruta generada en pedidos frente a gastos reales registrados.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Ventas Brutas:</span>
            <strong className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatUsd(totalGross)}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">Gastos:</span>
            <strong className="font-mono text-rose-600 dark:text-rose-400">
              {formatUsd(totalExp)}
            </strong>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6">
        {series.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
            No hay datos financieros para el rango seleccionado.
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id={salesGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id={expGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guías horizontales */}
              {[0, 0.5, 1].map((ratio) => {
                const y = padTop + plotH * (1 - ratio)
                const val = maxAmount * ratio
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
                      ${Math.round(val)}
                    </text>
                  </g>
                )
              })}

              {/* Áreas sombreadas */}
              {salesAreaPath && <path d={salesAreaPath} fill={`url(#${salesGradId})`} />}
              {expAreaPath && <path d={expAreaPath} fill={`url(#${expGradId})`} />}

              {/* Líneas de tendencia */}
              {salesLinePath && (
                <path
                  d={salesLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
              {expLinePath && (
                <path
                  d={expLinePath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Puntos interactivos y etiquetas del eje X */}
              {salesPoints.map((pt, idx) => {
                const expPt = expensePoints[idx]
                const isHovered = hoveredIdx === idx

                return (
                  <g
                    key={pt.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Línea vertical guía en hover */}
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

                    {/* Punto de ventas */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5.5 : 3.5}
                      className="fill-background stroke-emerald-600 transition-all"
                      strokeWidth={isHovered ? "3" : "2"}
                    />

                    {/* Punto de gastos */}
                    {expPt && (
                      <circle
                        cx={expPt.x}
                        cy={expPt.y}
                        r={isHovered ? 5.5 : 3.5}
                        className="fill-background stroke-rose-600 transition-all"
                        strokeWidth={isHovered ? "3" : "2"}
                      />
                    )}

                    {/* Etiqueta del mes */}
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
                    Ventas:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatUsd(activeItem.grossSalesUsd)}
                    </strong>
                  </span>
                  <span>
                    Gastos:{" "}
                    <strong className="text-rose-600 dark:text-rose-400 font-mono">
                      {formatUsd(activeItem.expensesUsd)}
                    </strong>
                  </span>
                  <span>
                    Margen Neto:{" "}
                    <strong
                      className={`font-mono ${
                        activeItem.netMarginUsd >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {activeItem.netMarginUsd >= 0 ? "+" : ""}
                      {formatUsd(activeItem.netMarginUsd)}
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

