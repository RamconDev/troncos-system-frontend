import * as React from "react"
import { Link } from "react-router-dom"
import { RefreshCw, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OverviewKpiCards } from "@/components/dashboard/OverviewKpiCards"
import { MonthlyProductsChart } from "@/components/dashboard/MonthlyProductsChart"
import { MonthlyCashflowChart } from "@/components/dashboard/MonthlyCashflowChart"
import { UnpaidProductsCard } from "@/components/dashboard/UnpaidProductsCard"
import { ProductInsightsCard } from "@/components/dashboard/ProductInsightsCard"
import {
  buildMonthlyProductsSeries,
  buildMonthlyCashflowSeries,
  buildUnpaidProductsData,
  buildProductInsights,
} from "@/components/dashboard/dashboard-metrics"
import { customerOrdersService } from "@/services/customer-orders.service"
import { movementsService } from "@/services/movements.service"
import { supplierOrdersService } from "@/services/supplier-orders.service"
import { dashboardService } from "@/services/dashboard.service"

export function DashboardOverviewPage() {
  const [orders, setOrders] = React.useState([])
  const [movements, setMovements] = React.useState([])
  const [supplierOrders, setSupplierOrders] = React.useState([])
  const [metrics, setMetrics] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const loadDashboardData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ordersRes, movsRes, lotsRes, metricsRes] = await Promise.all([
        customerOrdersService.getAll({ include_products: "true" }),
        movementsService.getAll(),
        supplierOrdersService.getAll({ summary: "true" }),
        dashboardService.getMetrics().catch(() => ({ data: null })),
      ])
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
      setMovements(Array.isArray(movsRes.data) ? movsRes.data : [])
      setSupplierOrders(Array.isArray(lotsRes.data) ? lotsRes.data : [])
      setMetrics(metricsRes?.data || null)
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const monthlyProducts = React.useMemo(
    () => buildMonthlyProductsSeries(orders, 6),
    [orders]
  )
  const monthlyCashflow = React.useMemo(
    () => buildMonthlyCashflowSeries(movements, 6),
    [movements]
  )
  const unpaidData = React.useMemo(
    () => buildUnpaidProductsData(orders, movements),
    [orders, movements]
  )
  const productInsights = React.useMemo(
    () => buildProductInsights(orders),
    [orders]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera Ejecutiva */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Vista General del Sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen operativo de prendas solicitadas, flujo de caja mensual, cuentas por cobrar y tendencias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={loadDashboardData}
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 sm:flex-initial"
          >
            <Link to="/lotes">
              <Package className="size-3.5" />
              Ver Lotes
            </Link>
          </Button>
          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link to="/nuevo">
              <Plus className="size-4" />
              Nueva Orden
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* 1. Fila de 4 Tarjetas Ejecutivas con Gráficos de Área Suavizada */}
      <OverviewKpiCards
        orders={orders}
        movements={movements}
        supplierOrders={supplierOrders}
        monthlyProducts={monthlyProducts}
        unpaidSummary={unpaidData}
        metrics={metrics}
      />

      {/* 2. Gráficas Mensuales: Prendas por Mes e Ingresos vs Egresos por Mes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MonthlyProductsChart series={monthlyProducts} />
        <MonthlyCashflowChart series={monthlyCashflow} />
      </div>

      {/* 3. Productos Más Vendidos (Últimos 3 Meses) y Distribución por Tallas */}
      <ProductInsightsCard insights={productInsights} />

      {/* 4. Listado de Productos que Aún Faltan por Cobrar con Enlace Directo a la Orden */}
      <UnpaidProductsCard unpaidData={unpaidData} />
    </div>
  )
}

