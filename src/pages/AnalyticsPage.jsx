import * as React from "react"
import { BarChart3, Lightbulb } from "lucide-react"
import { analyticsService } from "@/services/analytics.service"
import { customerOrdersService } from "@/services/customer-orders.service"
import { movementsService } from "@/services/movements.service"
import { processAnalyticsData } from "@/components/analytics/analytics-metrics"
import { AnalyticsTimeframeFilter } from "@/components/analytics/AnalyticsTimeframeFilter"
import { ExecutiveKpisRow } from "@/components/analytics/ExecutiveKpisRow"
import { MonthlyFinancialsChart } from "@/components/analytics/MonthlyFinancialsChart"
import { MonthlyProductsSoldChart } from "@/components/analytics/MonthlyProductsSoldChart"
import { TopProductsMonthlyCard } from "@/components/analytics/TopProductsMonthlyCard"
import { SizeDistributionCard } from "@/components/analytics/SizeDistributionCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/components/orders/order-constants"

export function AnalyticsPage() {
  const [backendData, setBackendData] = React.useState(null)
  const [fallbackData, setFallbackData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  // Selector de período: 3, 6, 12 o "ytd"
  const [timeframe, setTimeframe] = React.useState(6)
  // Selector de mes enfocado: "ALL" o "YYYY-MM"
  const [selectedMonthKey, setSelectedMonthKey] = React.useState("ALL")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const currentYear = new Date().getFullYear()
      const queryParams =
        timeframe === "ytd"
          ? { year: currentYear }
          : { months: Number(timeframe) || 6 }

      // 1. Consumir el endpoint agregado del backend
      try {
        const res = await analyticsService.getMonthly(queryParams)
        if (res && res.data) {
          setBackendData(res.data)
          setFallbackData(null)
          return
        }
      } catch (backendErr) {
        console.warn("Analytics backend unavailable, using fallback:", backendErr)
      }

      // 2. Fallback de resiliencia en cliente si el backend está en transición
      const [ordersRes, movsRes] = await Promise.all([
        customerOrdersService.getAll({ include_products: "true" }),
        movementsService.getAll(),
      ])
      const ords = Array.isArray(ordersRes.data) ? ordersRes.data : []
      const movs = Array.isArray(movsRes.data) ? movsRes.data : []
      const processed = processAnalyticsData({
        orders: ords,
        movements: movs,
        timeframe,
        selectedMonthKey: "ALL",
      })
      setFallbackData(processed)
      setBackendData(null)
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Normalización de datos entre backend / fallback
  const monthlySeries = React.useMemo(() => {
    if (backendData?.monthly_series) return backendData.monthly_series
    if (fallbackData?.monthlySeries) return fallbackData.monthlySeries
    return []
  }, [backendData, fallbackData])

  const topProducts = React.useMemo(() => {
    if (backendData?.top_products) return backendData.top_products
    if (fallbackData?.topProducts) return fallbackData.topProducts
    return []
  }, [backendData, fallbackData])

  const sizeDistribution = React.useMemo(() => {
    if (backendData?.size_distribution) return backendData.size_distribution
    if (fallbackData?.sizeDistribution) return fallbackData.sizeDistribution
    return []
  }, [backendData, fallbackData])

  const monthlySizesMatrix = React.useMemo(() => {
    if (backendData?.monthly_sizes_matrix) return backendData.monthly_sizes_matrix
    if (fallbackData?.monthlySizesMatrix) return fallbackData.monthlySizesMatrix
    return []
  }, [backendData, fallbackData])

  const activeMonth = React.useMemo(() => {
    if (selectedMonthKey === "ALL") return null
    return monthlySeries.find((m) => (m.key || m.month_key) === selectedMonthKey) || null
  }, [selectedMonthKey, monthlySeries])

  // KPIs dinámicos (calculados para todo el período o para el mes enfocado)
  const displayKpis = React.useMemo(() => {
    if (selectedMonthKey !== "ALL" && activeMonth) {
      const gross = Number(activeMonth.gross_sales_usd ?? activeMonth.grossSalesUsd ?? 0)
      const exp = Number(activeMonth.expenses_usd ?? activeMonth.expensesUsd ?? 0)
      const net = Number(activeMonth.net_margin_usd ?? activeMonth.netMarginUsd ?? (gross - exp))
      const marginPct = Number(
        activeMonth.profit_margin_percent ??
          activeMonth.profitMarginPercent ??
          (gross > 0 ? Math.round((net / gross) * 100) : 0)
      )
      const garments = Number(activeMonth.garments_count ?? activeMonth.garmentsCount ?? 0)
      const orders = Number(activeMonth.orders_count ?? activeMonth.ordersCount ?? 0)

      return {
        total_gross_sales_usd: gross,
        total_expenses_usd: exp,
        total_collected_usd: gross,
        net_operating_profit_usd: net,
        profit_margin_percent: marginPct,
        total_garments_count: garments,
        total_orders_count: orders,
        average_order_value_usd: orders > 0 ? Number((gross / orders).toFixed(2)) : 0,
        average_garments_per_order: orders > 0 ? Number((garments / orders).toFixed(1)) : 0,
      }
    }
    return backendData?.kpis || fallbackData?.kpis || {}
  }, [selectedMonthKey, activeMonth, backendData, fallbackData])

  const timeframeLabel =
    selectedMonthKey !== "ALL" && activeMonth
      ? activeMonth.full_label || activeMonth.fullLabel || activeMonth.label
      : typeof timeframe === "number"
      ? `Últimos ${timeframe} meses`
      : `Año ${new Date().getFullYear()}`

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Cabecera Ejecutiva */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <BarChart3 className="size-6 text-primary" />
            Estadísticas & Reportes
          </h1>
          <p className="text-sm text-muted-foreground">
            Métricas de facturación bruta, gastos, demanda de prendas por mes, productos estrella y análisis de tallas.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* 2. Barra de Control de Rango Temporal */}
      <AnalyticsTimeframeFilter
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        monthlySeries={monthlySeries}
        selectedMonthKey={selectedMonthKey}
        onSelectMonthKey={setSelectedMonthKey}
        loading={loading}
        onRefresh={loadData}
      />

      {/* 3. Fila de KPIs Ejecutivos del Período */}
      <ExecutiveKpisRow kpis={displayKpis} timeframeLabel={timeframeLabel} />

      {/* 4. Gráficas Principales: Ventas Brutas vs Gastos + Prendas y Pedidos */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MonthlyFinancialsChart series={monthlySeries} />
        <MonthlyProductsSoldChart series={monthlySeries} />
      </div>

      {/* 5. Secciones de Detalle: Productos Más Vendidos + Distribución de Tallas */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProductsMonthlyCard
          topProducts={topProducts}
          monthlySeries={monthlySeries}
          selectedMonthKey={selectedMonthKey}
          onSelectMonthKey={setSelectedMonthKey}
        />
        <SizeDistributionCard
          sizeDistribution={sizeDistribution}
          allUniqueSizes={[]}
          monthlySizesMatrix={monthlySizesMatrix}
        />
      </div>

      {/* 6. Caja de Insights y Conclusiones Operativas */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lightbulb className="size-4 text-amber-500" />
            <span>Diagnóstico Ejecutivo del Negocio ({timeframeLabel})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <div className="rounded-md border bg-background/80 p-3">
            <strong className="block font-semibold text-foreground mb-1">
              🛍️ Rendimiento de Pedidos
            </strong>
            <p className="text-muted-foreground">
              Se han registrado un total de{" "}
              <span className="font-bold text-foreground">
                {displayKpis.total_orders_count ?? 0} pedidos
              </span>{" "}
              con un promedio de{" "}
              <span className="font-bold text-foreground">
                {displayKpis.average_garments_per_order ?? 0} prendas por pedido
              </span>
              , promediando un ticket de{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatUsd(displayKpis.average_order_value_usd ?? 0)}
              </span>
              .
            </p>
          </div>

          <div className="rounded-md border bg-background/80 p-3">
            <strong className="block font-semibold text-foreground mb-1">
              📐 Talla Dominante
            </strong>
            <p className="text-muted-foreground">
              {sizeDistribution.length > 0 ? (
                <>
                  La talla con mayor rotación es{" "}
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {sizeDistribution[0].size}
                  </span>{" "}
                  representando el{" "}
                  <span className="font-bold text-foreground">
                    {sizeDistribution[0].percentage}%
                  </span>{" "}
                  de todas las prendas demandadas. Considera aumentar el ratio de esta talla al pedir lotes.
                </>
              ) : (
                "Aún no hay suficiente historial de tallas."
              )}
            </p>
          </div>

          <div className="rounded-md border bg-background/80 p-3">
            <strong className="block font-semibold text-foreground mb-1">
              📈 Eficiencia y Rentabilidad
            </strong>
            <p className="text-muted-foreground">
              Margen de ganancia operativo situado en{" "}
              <span
                className={`font-bold ${
                  (displayKpis.profit_margin_percent ?? 0) >= 30
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {displayKpis.profit_margin_percent ?? 0}%
              </span>
              . Mantén los gastos logísticos y de flete por debajo del 25% de la venta bruta para maximizar el retorno.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
