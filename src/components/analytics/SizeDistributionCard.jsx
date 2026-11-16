import * as React from "react"
import { Layers, Table as TableIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SizeDistributionCard({
  sizeDistribution = [],
  allUniqueSizes = [],
  monthlySizesMatrix = [],
}) {
  const [viewMode, setViewMode] = React.useState("chart") // "chart" o "matrix"
  const maxCount = Math.max(...sizeDistribution.map((s) => s.count), 1)

  const uniqueSizes = React.useMemo(() => {
    if (allUniqueSizes && allUniqueSizes.length > 0) return allUniqueSizes
    const set = new Set()
    sizeDistribution.forEach((s) => s.size && set.add(s.size))
    monthlySizesMatrix.forEach((m) => {
      const sizesObj = m.sizes || {}
      Object.keys(sizesObj).forEach((k) => set.add(k))
    })
    return Array.from(set).sort()
  }, [allUniqueSizes, sizeDistribution, monthlySizesMatrix])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-purple-600 dark:text-purple-400" />
            <span>Distribución de Tallas Vendidas</span>
          </CardTitle>
          <CardDescription>
            Análisis de tallas más demandadas para planificación de pedidos al proveedor.
          </CardDescription>
        </div>

        {/* Switch entre Vista Gráfica y Matriz Mes a Mes */}
        <div className="inline-flex rounded-lg border bg-muted p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("chart")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === "chart"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ranking
          </button>
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === "matrix"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Matriz Mensual
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-6 sm:px-6">
        {sizeDistribution.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
            No hay información de tallas para el período seleccionado.
          </div>
        ) : viewMode === "chart" ? (
          // Vista 1: Ranking de Tallas con Porcentajes
          <div className="space-y-3">
            {sizeDistribution.map((item) => {
              const ratio = (item.count / maxCount) * 100

              return (
                <div key={item.size} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-bold px-2 py-0.5"
                      >
                        {item.size}
                      </Badge>
                      <span className="text-muted-foreground">
                        {item.count} {item.count === 1 ? "prenda" : "prendas"}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-foreground">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-500"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Vista 2: Matriz Evolutiva de Tallas Mes a Mes
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Mes</th>
                  {uniqueSizes.map((s) => (
                    <th key={s} className="px-2 py-2 text-center font-semibold">
                      {s}
                    </th>
                  ))}
                  <th className="py-2 pl-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {monthlySizesMatrix.map((row) => (
                  <tr
                    key={row.month_key || row.key || row.label}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-medium text-foreground">
                      {row.label}
                    </td>
                    {uniqueSizes.map((s) => {
                      const count = row.sizes ? (row.sizes[s] || 0) : (row[s] || 0)
                      return (
                        <td
                          key={s}
                          className={`px-2 py-2.5 text-center font-mono ${
                            count > 0 ? "font-bold text-foreground" : "text-muted-foreground/40"
                          }`}
                        >
                          {count > 0 ? count : "—"}
                        </td>
                      )
                    })}
                    <td className="py-2.5 pl-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      {row.total}u
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

