import * as React from "react"
import { Award, Shirt, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/components/orders/order-constants"

export function TopProductsMonthlyCard({
  topProducts = [],
  monthlySeries = [],
  selectedMonthKey = "ALL",
  onSelectMonthKey,
}) {
  const maxCount = Math.max(...topProducts.map((p) => p.count), 1)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="size-4 text-amber-500" />
            <span>Productos Más Vendidos</span>
          </CardTitle>
          <CardDescription>
            Modelos y camisetas con mayor demanda y facturación en el período.
          </CardDescription>
        </div>

        {/* Selector de Mes para este Ranking */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Filtrar mes:
          </label>
          <select
            value={selectedMonthKey}
            onChange={(e) => onSelectMonthKey?.(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todo el período seleccionado</option>
            {monthlySeries.map((m) => (
              <option key={m.key} value={m.key}>
                {m.fullLabel}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-6 sm:px-6">
        {topProducts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Shirt className="size-6 text-muted-foreground/40" />
            <p>No se registraron productos en el mes/período seleccionado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topProducts.slice(0, 8).map((prod, idx) => {
              const ratio = (prod.count / maxCount) * 100

              return (
                <div
                  key={prod.name}
                  className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            : idx === 1
                            ? "bg-zinc-400/20 text-zinc-700 dark:text-zinc-300"
                            : idx === 2
                            ? "bg-amber-700/20 text-amber-800 dark:text-amber-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-sm truncate text-foreground">
                        {prod.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <Badge variant="secondary" className="font-mono">
                        {prod.count} {prod.count === 1 ? "ud" : "uds"}
                      </Badge>
                      <span className="font-mono font-bold text-foreground">
                        {formatUsd(
                          prod.gross_revenue_usd ?? prod.grossRevenueUsd ?? 0
                        )}
                      </span>
                      {(prod.estimated_profit_usd ?? prod.estimatedProfitUsd) >
                        0 && (
                        <span className="hidden sm:inline-block font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                          (+
                          {formatUsd(
                            prod.estimated_profit_usd ??
                              prod.estimatedProfitUsd ??
                              0
                          )}{" "}
                          ganancia)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso de demanda */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

