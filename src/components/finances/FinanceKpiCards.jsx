import { Wallet, Clock, Coins, TrendingUp, Landmark } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SparklineAreaChart } from "@/components/finances/SparklineAreaChart"
import { formatUsd } from "@/components/orders/order-constants"

export function FinanceKpiCards({
  movements = [],
  orders = [],
  currencies = [],
}) {
  // Ordenar movimientos cronológicamente para las curvas suavizadas
  const sortedMovements = [...movements].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  )

  // 1. Dinero Total en Caja (Físico / Digital en USD) + Serie acumulada
  // Saldo = sum(INCOME todos, incluyendo CAPITAL_INJECTION) - sum(EXPENSE)
  let totalIncomeUsd = 0
  let totalExpenseUsd = 0
  let totalSalesIncomeUsd = 0
  let totalCapitalInjectionUsd = 0
  let runningBalance = 0
  const balanceSeries = []
  const salesIncomeSeries = []

  sortedMovements.forEach((mov) => {
    const usd = Number(mov.amount_usd || 0)
    const catName = String(mov.category_name || "").toUpperCase()
    if (mov.movement_type === "INCOME") {
      totalIncomeUsd += usd
      runningBalance += usd
      if (catName === "CAPITAL_INJECTION") {
        totalCapitalInjectionUsd += usd
      } else {
        totalSalesIncomeUsd += usd
        salesIncomeSeries.push(usd)
      }
    } else {
      totalExpenseUsd += usd
      runningBalance -= usd
    }
    balanceSeries.push(Number(runningBalance.toFixed(2)))
  })

  const netCashUsd = totalIncomeUsd - totalExpenseUsd

  // 2. Total por Cobrar de Pedidos Confirmados (UNPAID / PARTIAL descontando abonos asociados por source_id)
  const paidByOrderId = new Map()
  movements.forEach((mov) => {
    if (mov.movement_type === "INCOME" && mov.source_id) {
      const prev = paidByOrderId.get(mov.source_id) || 0
      paidByOrderId.set(mov.source_id, prev + Number(mov.amount_usd || 0))
    }
  })

  let pendingToCollectUsd = 0
  let pendingOrdersCount = 0
  const receivableSeries = []

  orders.forEach((ord) => {
    if (ord.payment_status === "PAID") return
    const saleUsd = Number(ord.total_sale_price_usd || 0)
    const abonosUsd = paidByOrderId.get(ord.id) || 0
    const remaining = Math.max(0, saleUsd - abonosUsd)
    if (remaining > 0) {
      pendingToCollectUsd += remaining
      pendingOrdersCount += 1
      receivableSeries.push(Number(remaining.toFixed(2)))
    }
  })

  // 3. Saldos por Moneda (solo aquellas con total diferente de cero)
  const currencyMetaMap = new Map()
  currencies.forEach((c) => currencyMetaMap.set(c.id, c))

  const balanceByCurrency = new Map()
  movements.forEach((mov) => {
    const code =
      mov.currency_code ||
      currencyMetaMap.get(mov.currency_id)?.code ||
      `ID-${mov.currency_id}`
    const symbol = currencyMetaMap.get(mov.currency_id)?.symbol || code
    const sign = mov.movement_type === "INCOME" ? 1 : -1
    const nativeDelta = sign * Number(mov.amount || 0)
    const usdDelta = sign * Number(mov.amount_usd || 0)

    const current = balanceByCurrency.get(code) || {
      code,
      symbol,
      nativeTotal: 0,
      usdTotal: 0,
    }
    current.nativeTotal += nativeDelta
    current.usdTotal += usdDelta
    balanceByCurrency.set(code, current)
  })

  const nonZeroCurrencies = Array.from(balanceByCurrency.values()).filter(
    (item) => Math.abs(item.nativeTotal) > 0.009
  )

  const currencyUsdSeries = nonZeroCurrencies.map((c) =>
    Number(c.usdTotal.toFixed(2))
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Tarjeta 1: Dinero Total en Físico / Digital */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Físico / Digital (Caja)
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
          Ingresos:{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {formatUsd(totalIncomeUsd)}
          </strong>
          {totalCapitalInjectionUsd > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {" "}({formatUsd(totalSalesIncomeUsd)} ventas + {formatUsd(totalCapitalInjectionUsd)} aportes)
            </span>
          )}{" "}
          • Egresos:{" "}
          <strong className="text-rose-600 dark:text-rose-400">
            {formatUsd(totalExpenseUsd)}
          </strong>
        </div>
        <SparklineAreaChart
          data={balanceSeries.length ? balanceSeries : [0, netCashUsd]}
          color="#10b981"
        />
      </Card>

      {/* Tarjeta 2: Total por Cobrar de Pedidos Hechos */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Por Cobrar (Pedidos)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatUsd(pendingToCollectUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
            <Clock className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          En <strong className="text-foreground">{pendingOrdersCount}</strong>{" "}
          pedido(s) confirmados pendientes de pago
        </div>
        <SparklineAreaChart
          data={
            receivableSeries.length
              ? receivableSeries
              : [0, pendingToCollectUsd]
          }
          color="#f59e0b"
        />
      </Card>

      {/* Tarjeta 3: Total por cada Moneda Diferente de Cero */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Saldos por Moneda (≠ 0)
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {nonZeroCurrencies.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Sin saldos activos
                </span>
              ) : (
                nonZeroCurrencies.map((curr) => (
                  <Badge
                    key={curr.code}
                    variant="secondary"
                    className="font-mono text-[11px] px-1.5 py-0.5"
                  >
                    {curr.code}: {curr.symbol}
                    {curr.nativeTotal.toLocaleString("es-CO", {
                      maximumFractionDigits: 2,
                    })}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
            <Coins className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {nonZeroCurrencies.length} divisa(s) con balance diferente de cero
        </div>
        <SparklineAreaChart
          data={currencyUsdSeries.length ? currencyUsdSeries : [0, 0]}
          color="#3b82f6"
        />
      </Card>

      {/* Tarjeta 4: Ventas Recaudadas (Clientes) - No computa CAPITAL_INJECTION como venta */}
      <Card className="flex flex-col justify-between gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Ventas Recaudadas (Clientes)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatUsd(totalSalesIncomeUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {totalCapitalInjectionUsd > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-teal-700 dark:text-teal-400">
              <Landmark className="size-3" />
              +{formatUsd(totalCapitalInjectionUsd)} en aportes de capital
            </span>
          ) : (
            <span>Ingresos operativos por abonos de clientes</span>
          )}
        </div>
        <SparklineAreaChart
          data={salesIncomeSeries.length ? salesIncomeSeries : [0, totalSalesIncomeUsd]}
          color="#10b981"
        />
      </Card>
    </div>
  )
}
