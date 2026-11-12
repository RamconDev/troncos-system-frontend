import * as React from "react"
import { ArrowUpDown } from "lucide-react"
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

export function MonthlyCashflowChart({ series = [] }) {
  const incGradId = React.useId()
  const expGradId = React.useId()

  const width = 480
  const height = 160
  const padX = 28
  const padTop = 24
  const padBottom = 28

  const maxAmount = Math.max(
    ...series.flatMap((s) => [s.incomeUsd, s.expenseUsd]),
    1
  )
  const plotW = width - padX * 2
  const plotH = height - padTop - padBottom

  const incomePoints = series.map((item, idx) => {
    const x =
      series.length > 1
        ? padX + (idx / (series.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.incomeUsd / maxAmount) * plotH
    return { x, y, ...item }
  })

  const expensePoints = series.map((item, idx) => {
    const x =
      series.length > 1
        ? padX + (idx / (series.length - 1)) * plotW
        : width / 2
    const y = padTop + plotH - (item.expenseUsd / maxAmount) * plotH
    return { x, y, ...item }
  })

  const incLine = buildSmoothCurve(incomePoints)
  const incArea =
    incomePoints.length > 0
      ? `${incLine} L ${incomePoints[incomePoints.length - 1].x.toFixed(1)} ${height - padBottom} L ${incomePoints[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  const expLine = buildSmoothCurve(expensePoints)
  const expArea =
    expensePoints.length > 0
      ? `${expLine} L ${expensePoints[expensePoints.length - 1].x.toFixed(1)} ${height - padBottom} L ${expensePoints[0].x.toFixed(1)} ${height - padBottom} Z`
      : ""

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base">
            Ingresos vs Egresos por Mes (USD)
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              Ingresos (INCOME)
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full bg-rose-500" />
              Egresos (EXPENSE)
            </span>
          </CardDescription>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
          <ArrowUpDown className="size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-2">
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-40 overflow-visible"
          >
            <defs>
              <linearGradient id={incGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id={expGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line
              x1={padX}
              y1={height - padBottom}
              x2={width - padX}
              y2={height - padBottom}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />

            {expArea && <path d={expArea} fill={`url(#${expGradId})`} />}
            {incArea && <path d={incArea} fill={`url(#${incGradId})`} />}

            {expLine && (
              <path
                d={expLine}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
            )}
            {incLine && (
              <path
                d={incLine}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {incomePoints.map((pt, idx) => {
              const expPt = expensePoints[idx]
              return (
                <g key={pt.key}>
                  <circle
                    cx={expPt.x}
                    cy={expPt.y}
                    r="3.5"
                    className="fill-background stroke-rose-500"
                    strokeWidth="2"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    className="fill-background stroke-emerald-500"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {pt.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Resumen mensual de Ingresos vs Egresos */}
        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs sm:grid-cols-6">
          {series.map((item) => (
            <div key={item.key} className="rounded bg-muted/30 px-2 py-1.5">
              <span className="block text-[10px] text-muted-foreground">
                {item.label}
              </span>
              <span className="block font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatUsd(item.incomeUsd)}
              </span>
              <span className="block font-mono text-[10px] text-rose-600 dark:text-rose-400">
                -{formatUsd(item.expenseUsd)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

