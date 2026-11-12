import { Award, Ruler } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatUsd } from "@/components/orders/order-constants"

export function ProductInsightsCard({
  insights = { topProducts: [], sizeDistribution: [], totalGarments: 0 },
}) {
  const { topProducts, sizeDistribution, totalGarments } = insights
  const maxProductCount = Math.max(...topProducts.map((p) => p.count), 1)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Productos Más Vendidos en los Últimos 3 Meses */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              Productos Más Vendidos (Últimos 3 Meses)
            </CardTitle>
            <CardDescription>
              Ranking de modelos con mayor demanda y facturación reciente.
            </CardDescription>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="size-4" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aún no hay productos registrados en los últimos 3 meses.
            </p>
          ) : (
            topProducts.map((prod, idx) => {
              const barWidth = Math.round((prod.count / maxProductCount) * 100)
              return (
                <div key={prod.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-foreground truncate" title={prod.name}>
                        {prod.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {prod.count} uds
                      </Badge>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatUsd(prod.revenueUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* 2. Distribución por Tallas Solicitadas */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              Distribución por Tallas
            </CardTitle>
            <CardDescription>
              Proporción de tallas solicitadas sobre un total de {totalGarments} prenda(s).
            </CardDescription>
          </div>
          <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
            <Ruler className="size-4" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {sizeDistribution.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin datos de tallas registrados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sizeDistribution.map((item) => (
                <div
                  key={item.size}
                  className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="font-mono font-bold">
                      {item.size}
                    </Badge>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{item.count}</strong> uds ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

