import * as React from "react"
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Boxes,
  ShoppingBag,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/components/orders/order-constants"

export function ExecutiveKpisRow({ kpis = {}, timeframeLabel = "" }) {
  const grossSales =
    kpis.total_gross_sales_usd ?? kpis.periodGrossSalesUsd ?? 0
  const expenses =
    kpis.total_expenses_usd ?? kpis.periodExpensesUsd ?? 0
  const collected =
    kpis.total_collected_usd ?? kpis.periodCollectedIncomeUsd ?? 0
  const netMargin =
    kpis.net_operating_profit_usd ??
    kpis.periodNetMarginUsd ??
    Number((grossSales - expenses).toFixed(2))
  const marginPercent =
    kpis.profit_margin_percent ?? kpis.periodProfitMarginPercent ?? 0
  const garmentsCount =
    kpis.total_garments_count ?? kpis.periodGarmentsCount ?? 0
  const ordersCount =
    kpis.total_orders_count ?? kpis.periodOrdersCount ?? 0
  const aov =
    kpis.average_order_value_usd ?? kpis.averageOrderValueUsd ?? 0
  const garmentsPerOrder =
    kpis.average_garments_per_order ?? kpis.averageItemsPerOrder ?? 0

  const isPositiveMargin = netMargin >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* 1. Dinero en Bruto (Ventas) */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Ventas Brutas ({timeframeLabel})
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatUsd(grossSales)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
            <DollarSign className="size-4" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground border-t pt-1.5 flex justify-between">
          <span>Cobrado en caja:</span>
          <strong className="font-mono text-emerald-600 dark:text-emerald-400">
            {formatUsd(collected)}
          </strong>
        </div>
      </Card>

      {/* 2. Gastos Totales */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Gastos del Período
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatUsd(expenses)}
            </p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400 shrink-0">
            <Receipt className="size-4" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground border-t pt-1.5 flex justify-between">
          <span>Mercancía + Fletes</span>
          <span className="font-mono text-xs text-foreground">
            {grossSales > 0
              ? `${Math.round((expenses / grossSales) * 100)}% ventas`
              : "—"}
          </span>
        </div>
      </Card>

      {/* 3. Margen de Ganancia Neta */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Margen de Ganancia
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight font-mono ${
                  isPositiveMargin
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isPositiveMargin ? "+" : ""}
                {formatUsd(netMargin)}
              </span>
            </div>
          </div>
          <div
            className={`rounded-lg p-2 shrink-0 ${
              isPositiveMargin
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground border-t pt-1.5 flex items-center justify-between">
          <span>Rentabilidad:</span>
          <Badge
            variant="outline"
            className={`font-mono text-[10px] h-4.5 px-1.5 ${
              isPositiveMargin
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
            }`}
          >
            {marginPercent}% margen
          </Badge>
        </div>
      </Card>

      {/* 4. Prendas Vendidas / Activas */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Prendas Vendidas
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {garmentsCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                uds
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
            <Boxes className="size-4" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground border-t pt-1.5 flex justify-between">
          <span>Pedidos registrados:</span>
          <strong className="font-mono text-foreground">
            {ordersCount} pedido(s)
          </strong>
        </div>
      </Card>

      {/* 5. Ticket Promedio (AOV) */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Ticket Promedio (AOV)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatUsd(aov)}
            </p>
          </div>
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400 shrink-0">
            <ShoppingBag className="size-4" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground border-t pt-1.5 flex justify-between">
          <span>Promedio por orden:</span>
          <strong className="font-mono text-foreground">
            {garmentsPerOrder} prendas
          </strong>
        </div>
      </Card>
    </div>
  )
}
