import * as React from "react"
import {
  Wallet,
  TrendingUp,
  Boxes,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Hourglass,
  Layers,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SparklineAreaChart } from "@/components/finances/SparklineAreaChart"
import { formatUsd } from "@/components/orders/order-constants"

export function OverviewKpiCards({
  orders = [],
  movements = [],
  supplierOrders = [],
  monthlyProducts = [],
  unpaidSummary = { totalPendingUsd: 0, unpaidOrdersCount: 0, unpaidProductsCount: 0 },
  metrics = null,
}) {
  // 1. Saldo en Caja (Total activo en el momento)
  let totalIncomeUsd = 0
  let totalExpenseUsd = 0
  let totalSalesIncomeUsd = 0
  let totalCapitalInjectionUsd = 0
  let runningCash = 0
  const cashSeries = []

  const sortedMovs = [...movements].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  )

  sortedMovs.forEach((m) => {
    const val = Number(m.amount_usd || 0)
    const cat = String(m.category_name || "").toUpperCase()
    if (m.movement_type === "INCOME") {
      totalIncomeUsd += val
      runningCash += val
      if (cat === "CAPITAL_INJECTION") {
        totalCapitalInjectionUsd += val
      } else {
        totalSalesIncomeUsd += val
      }
    } else {
      totalExpenseUsd += val
      runningCash -= val
    }
    cashSeries.push(Number(runningCash.toFixed(2)))
  })

  // 2. Inversión real en lotes (Mercancía Proveedor + Logística y Fletes)
  let totalRealSupplierPaidUsd = 0
  let totalLogisticsUsd = 0
  const paidByOrderId = new Map()

  movements.forEach((m) => {
    const val = Number(m.amount_usd || 0)
    if (m.movement_type === "EXPENSE") {
      const cat = String(m.category_name || "").toUpperCase()
      if (cat === "SUPPLIER_PAYMENT") {
        totalRealSupplierPaidUsd += val
      } else if (cat === "LOGISTICS") {
        totalLogisticsUsd += val
      }
    } else if (m.movement_type === "INCOME" && m.source_id) {
      const prev = paidByOrderId.get(m.source_id) || 0
      paidByOrderId.set(m.source_id, prev + val)
    }
  })

  const totalInvestedInLotsUsd = totalRealSupplierPaidUsd + totalLogisticsUsd

  // 3. Segmentación de pedidos: ACTIVAS (en lote) vs INACTIVAS / EN ESPERA (sin lote)
  let activeSalePriceUsd = 0
  let activeBaseCostUsd = 0
  let activeGarmentsCount = 0
  let activeOrdersCount = 0
  let activePendingOrdersCount = 0
  let activePendingBalanceUsd = 0

  let inactiveSalePriceUsd = 0
  let inactiveBaseCostUsd = 0
  let inactiveGarmentsCount = 0
  let inactiveOrdersCount = 0

  // Conteo de prendas por estado
  let paidGarmentsCount = 0
  let activePendingGarmentsCount = 0

  orders.forEach((ord) => {
    const prods = Array.isArray(ord.products) ? ord.products : []
    const count = prods.length
    const sale = Number(ord.total_sale_price_usd || 0)
    const base = Number(ord.total_base_cost_usd || 0)
    const isPaid = ord.payment_status === "PAID"
    const hasLot = Boolean(ord.supplier_order_id)

    if (hasLot) {
      activeOrdersCount += 1
      activeGarmentsCount += count
      activeSalePriceUsd += sale
      activeBaseCostUsd += base

      if (isPaid) {
        paidGarmentsCount += count
      } else {
        activePendingGarmentsCount += count
        activePendingOrdersCount += 1
        const paid = paidByOrderId.get(ord.id) || 0
        const rem = Math.max(0, Number((sale - paid).toFixed(2)))
        activePendingBalanceUsd = Number((activePendingBalanceUsd + rem).toFixed(2))
      }
    } else {
      // Pedido inactivo / en espera (sin lote pedido al proveedor)
      inactiveOrdersCount += 1
      inactiveGarmentsCount += count
      inactiveSalePriceUsd += sale
      inactiveBaseCostUsd += base

      if (isPaid) {
        paidGarmentsCount += count
      }
    }
  })

  const totalGarments = activeGarmentsCount + inactiveGarmentsCount

  // Costo efectivo de lotes activos (mercancía + fletes)
  const effectiveActiveLotsCostUsd =
    (totalRealSupplierPaidUsd > 0 ? totalRealSupplierPaidUsd : activeBaseCostUsd) +
    totalLogisticsUsd

  // Priorizar métricas agregadas del backend si están disponibles:
  const netCashUsd =
    metrics?.cash_flow?.net_cash_usd !== undefined
      ? Number(metrics.cash_flow.net_cash_usd)
      : Number((totalIncomeUsd - totalExpenseUsd).toFixed(2))

  const displayTotalIncomeUsd =
    metrics?.cash_flow?.total_income_usd !== undefined
      ? Number(metrics.cash_flow.total_income_usd)
      : totalIncomeUsd

  const displayTotalExpenseUsd =
    metrics?.cash_flow?.total_expense_usd !== undefined
      ? Number(metrics.cash_flow.total_expense_usd)
      : totalExpenseUsd

  const displayTotalSalesIncomeUsd =
    metrics?.cash_flow?.sales_income_usd !== undefined
      ? Number(metrics.cash_flow.sales_income_usd)
      : totalSalesIncomeUsd

  const displayTotalCapitalInjectionUsd =
    metrics?.cash_flow?.capital_injection_usd !== undefined
      ? Number(metrics.cash_flow.capital_injection_usd)
      : totalCapitalInjectionUsd

  const displayTotalInvestedInLotsUsd =
    metrics?.profitability?.total_lot_expenses_usd !== undefined
      ? Number(metrics.profitability.total_lot_expenses_usd)
      : totalInvestedInLotsUsd

  const currentRealProfitUsd =
    metrics?.profitability?.current_real_profit_usd !== undefined
      ? Number(metrics.profitability.current_real_profit_usd)
      : Number((totalSalesIncomeUsd - totalInvestedInLotsUsd).toFixed(2))

  const isRecovered =
    metrics?.profitability?.is_investment_recovered !== undefined
      ? Boolean(metrics.profitability.is_investment_recovered)
      : currentRealProfitUsd >= 0

  const activeEstimatedProfitUsd =
    metrics?.profitability?.active_estimated_profit_usd !== undefined
      ? Number(metrics.profitability.active_estimated_profit_usd)
      : Number((activeSalePriceUsd - effectiveActiveLotsCostUsd).toFixed(2))

  const displayInactiveGarmentsCount =
    metrics?.profitability?.inactive_garments_count !== undefined
      ? Number(metrics.profitability.inactive_garments_count)
      : inactiveGarmentsCount

  const displayInactiveSalePriceUsd =
    metrics?.profitability?.inactive_potential_sales_usd !== undefined
      ? Number(metrics.profitability.inactive_potential_sales_usd)
      : inactiveSalePriceUsd

  const displayTotalGarments =
    metrics?.garments?.total_count !== undefined
      ? Number(metrics.garments.total_count)
      : totalGarments

  const displayPaidGarmentsCount =
    metrics?.garments?.paid_count !== undefined
      ? Number(metrics.garments.paid_count)
      : paidGarmentsCount

  const displayActivePendingGarmentsCount =
    metrics?.garments?.active_pending_count !== undefined
      ? Number(metrics.garments.active_pending_count)
      : activePendingGarmentsCount

  const displayInactiveUnitsCount =
    metrics?.garments?.inactive_count !== undefined
      ? Number(metrics.garments.inactive_count)
      : inactiveGarmentsCount

  // 4. Falta por Cobrar (SOLO órdenes activas asignadas a un lote de proveedor)
  const displayPendingBalanceUsd =
    metrics?.profitability?.active_pending_receivables_usd !== undefined
      ? Number(metrics.profitability.active_pending_receivables_usd)
      : (metrics?.receivables?.pending_balance_usd !== undefined
          ? Number(metrics.receivables.pending_balance_usd)
          : activePendingBalanceUsd)

  const displayPendingOrdersCount =
    metrics?.receivables?.active_pending_orders_count !== undefined
      ? Number(metrics.receivables.active_pending_orders_count)
      : activePendingOrdersCount

  const displayPendingGarmentsCount =
    metrics?.garments?.active_pending_count !== undefined
      ? Number(metrics.garments.active_pending_count)
      : activePendingGarmentsCount

  const garmentsSeries = monthlyProducts.map((m) => m.garments)
  const paidGarmentsPercentage =
    displayTotalGarments > 0
      ? Math.round((displayPaidGarmentsCount / displayTotalGarments) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Saldo en Caja (Activo en el momento) */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Saldo en caja
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatUsd(netCashUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Wallet className="size-4" />
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground border-t pt-2 space-y-0.5">
          <div className="flex items-center justify-between">
            <span>Ingresos totales:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
              {formatUsd(displayTotalIncomeUsd)}
            </strong>
          </div>
          {displayTotalCapitalInjectionUsd > 0 && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pl-2">
              <span>↳ Ventas: {formatUsd(displayTotalSalesIncomeUsd)} • Aportes: {formatUsd(displayTotalCapitalInjectionUsd)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Egresos totales:</span>
            <strong className="text-rose-600 dark:text-rose-400 font-mono">
              {formatUsd(displayTotalExpenseUsd)}
            </strong>
          </div>
        </div>

        <SparklineAreaChart
          data={cashSeries.length ? cashSeries : [0, netCashUsd]}
          color="#10b981"
        />
      </Card>

      {/* 2. Ganancias & Rentabilidad (Actual recaudada + Estimada activa + En espera) */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ganancias & Rentabilidad
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold tracking-tight font-mono ${
                    isRecovered
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {currentRealProfitUsd >= 0 ? "+" : ""}
                  {formatUsd(currentRealProfitUsd)}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold h-4.5 px-1.5 ${
                    isRecovered
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  {isRecovered ? "Ganancia en mano" : "Por recuperar"}
                </Badge>
              </div>
            </div>

            <div
              className={`rounded-lg p-2 shrink-0 ${
                isRecovered
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isRecovered ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowDownRight className="size-4" />
              )}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-0.5">
            Recaudado ({formatUsd(displayTotalSalesIncomeUsd)}) vs Inversión ({formatUsd(displayTotalInvestedInLotsUsd)})
          </p>
        </div>

        {/* Desglose de Ganancias Estimadas y En Espera */}
        <div className="text-[11px] border-t pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Estimada (activas en lote):
            </span>
            <span className="font-mono font-bold text-foreground">
              {activeEstimatedProfitUsd >= 0 ? "+" : ""}
              {formatUsd(activeEstimatedProfitUsd)} USD
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              En espera ({displayInactiveGarmentsCount} prendas sin pedir):
            </span>
            <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
              {formatUsd(displayInactiveSalePriceUsd)} USD venta
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Total en Unidades de Prendas (Vendidas, Por cobrar, Por pedir) */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Prendas (Unidades)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {displayTotalGarments}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                uds registradas
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
            <Boxes className="size-4" />
          </div>
        </div>

        {/* Desglose en 3 categorías de prendas */}
        <div className="text-[11px] border-t pt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              Vendidas (cobradas):
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {displayPaidGarmentsCount} uds{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                ({paidGarmentsPercentage}%)
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-amber-500" />
              Por cobrar (activas en lote):
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              {displayActivePendingGarmentsCount} uds
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-zinc-400" />
              Por pedir (inactivas/sin lote):
            </span>
            <span className="font-mono font-bold text-foreground">
              {displayInactiveUnitsCount} uds
            </span>
          </div>
        </div>

        <SparklineAreaChart
          data={garmentsSeries.length ? garmentsSeries : [0, displayTotalGarments]}
          color="#3b82f6"
        />
      </Card>

      {/* 4. Por Cobrar a Clientes (Solo Órdenes Activas en Lote) */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Falta por Cobrar (Activas)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatUsd(displayPendingBalanceUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="size-4" />
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground border-t pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span>Órdenes activas pendientes:</span>
            <strong className="text-foreground font-mono">
              {displayPendingOrdersCount} pedido(s)
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Prendas activas por cobrar:</span>
            <strong className="text-foreground font-mono">
              {displayPendingGarmentsCount} prenda(s)
            </strong>
          </div>
        </div>

        <SparklineAreaChart
          data={[displayPendingOrdersCount, displayPendingBalanceUsd]}
          color="#f59e0b"
        />
      </Card>
    </div>
  )
}
