import { Wallet, TrendingUp, Boxes, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SparklineAreaChart } from "@/components/finances/SparklineAreaChart"
import { formatUsd } from "@/components/orders/order-constants"

export function OverviewKpiCards({
  orders = [],
  movements = [],
  monthlyProducts = [],
  unpaidSummary = { totalPendingUsd: 0, unpaidOrdersCount: 0, unpaidProductsCount: 0 },
}) {
  // 1. Balance en caja
  let totalIncomeUsd = 0
  let totalExpenseUsd = 0
  let runningCash = 0
  const cashSeries = []

  const sortedMovs = [...movements].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  )
  sortedMovs.forEach((m) => {
    const val = Number(m.amount_usd || 0)
    if (m.movement_type === "INCOME") {
      totalIncomeUsd += val
      runningCash += val
    } else {
      totalExpenseUsd += val
      runningCash -= val
    }
    cashSeries.push(Number(runningCash.toFixed(2)))
  })
  const netCashUsd = totalIncomeUsd - totalExpenseUsd

  // 2. Ventas y Ganancia Estimada en Pedidos
  let totalSaleUsd = 0
  let totalProfitUsd = 0
  let totalGarments = 0
  let unassignedOrdersCount = 0
  const profitSeries = []

  orders.forEach((o) => {
    const sale = Number(o.total_sale_price_usd || 0)
    const profit = Number(o.profit_usd || 0)
    totalSaleUsd += sale
    totalProfitUsd += profit
    totalGarments += o.products?.length ?? 0
    if (!o.supplier_order_id) unassignedOrdersCount += 1
    profitSeries.push(profit)
  })

  const garmentsSeries = monthlyProducts.map((m) => m.garments)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Dinero en Caja */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Saldo Neto en Caja (USD)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatUsd(netCashUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
            <Wallet className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Ingresos: <strong>{formatUsd(totalIncomeUsd)}</strong> • Egresos:{" "}
          <strong>{formatUsd(totalExpenseUsd)}</strong>
        </div>
        <SparklineAreaChart
          data={cashSeries.length ? cashSeries : [0, netCashUsd]}
          color="#10b981"
        />
      </Card>

      {/* 2. Ganancia Estimada en Pedidos */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Ganancia Estimada (Pedidos)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatUsd(totalProfitUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Sobre ventas totales de <strong>{formatUsd(totalSaleUsd)}</strong> en{" "}
          {orders.length} pedido(s)
        </div>
        <SparklineAreaChart
          data={profitSeries.length ? profitSeries : [0, totalProfitUsd]}
          color="#6366f1"
        />
      </Card>

      {/* 3. Total Prendas Pedidas */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Prendas Solicitadas
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {totalGarments} <span className="text-sm font-normal text-muted-foreground">uds</span>
            </p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
            <Boxes className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <strong>{unassignedOrdersCount}</strong> orden(es) aún sin lote asignado
        </div>
        <SparklineAreaChart
          data={garmentsSeries.length ? garmentsSeries : [0, totalGarments]}
          color="#3b82f6"
        />
      </Card>

      {/* 4. Por Cobrar */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Falta por Cobrar
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatUsd(unpaidSummary.totalPendingUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
            <Clock className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <strong>{unpaidSummary.unpaidProductsCount}</strong> prenda(s) en{" "}
          <strong>{unpaidSummary.unpaidOrdersCount}</strong> orden(es) por cobrar
        </div>
        <SparklineAreaChart
          data={[unpaidSummary.unpaidOrdersCount, unpaidSummary.totalPendingUsd]}
          color="#f59e0b"
        />
      </Card>
    </div>
  )
}

