import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/components/orders/order-constants"

/**
 * Tarjetas de métricas financieras del lote:
 * - Card 1: Costo Real Base (combina Estimado Base, Pago Proveedor Real y Gastos de Logística/Fletes)
 * - Card 2: Recaudación de Clientes (Total recolectado vs estimado con barra y porcentaje al lado)
 * - Card 3: Ganancia Real Neta (con venta total)
 */
export function LotFinancialCards({ summary }) {
  if (!summary) return null

  const estimatedBaseCost = Number(summary.estimated_base_cost_usd || 0)
  const hasRealPayment = Boolean(summary.has_real_supplier_payment)
  const supplierPayment = Number(summary.supplier_payment_usd || 0)
  const supplierDiscount = Number(summary.supplier_discount_usd || 0)
  const logisticsExpense = Number(summary.logistics_expense_usd || 0)
  const logisticsCount = Number(summary.logistics_count || 0)
  const effectiveMerchandiseCost = Number(
    summary.effective_merchandise_cost_usd ??
      (hasRealPayment ? supplierPayment : estimatedBaseCost)
  )
  const totalRealCost = Number(
    summary.total_real_cost_usd ?? (effectiveMerchandiseCost + logisticsExpense)
  )

  const totalSalePrice = Number(summary.total_sale_price_usd || 0)
  const totalCollected = Number(summary.total_collected_usd || 0)
  const pendingToCollect = Number(
    summary.pending_to_collect_usd ??
      Math.max(0, Number((totalSalePrice - totalCollected).toFixed(2)))
  )
  const collectionPercentage =
    totalSalePrice > 0
      ? Math.min(100, Math.round((totalCollected / totalSalePrice) * 100))
      : 0

  const realProfit = Number(summary.real_profit_usd || 0)

  return (
    <div className="grid grid-cols-1 gap-3 border-b bg-muted/20 p-4 md:grid-cols-3 sm:px-6">
      {/* 1. Costo Real Base (Estimado Base + Proveedor + Logística y Fletes) */}
      <div className="rounded-xl border bg-card p-3.5 text-card-foreground shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Costo Real Base
            </p>
            {hasRealPayment ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              >
                PAGADO
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30"
              >
                PENDIENTE
              </Badge>
            )}
          </div>
          <p className="mt-1 font-mono text-xl font-bold text-foreground">
            {formatUsd(effectiveMerchandiseCost)} USD
          </p>
        </div>

        {/* Desglose: Estimado Base, Ahorro, Logística y Total Costos */}
        <div className="mt-2 space-y-1 text-[11px] border-t pt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Estimado base ({summary.garmentsCount ?? 0} prendas):
            </span>
            <span className="font-mono font-medium">
              {formatUsd(estimatedBaseCost)}
              {hasRealPayment && supplierDiscount !== 0 && (
                <span
                  className={`ml-1 font-semibold ${
                    supplierDiscount > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  ({supplierDiscount > 0 ? "+" : ""}
                  {formatUsd(supplierDiscount)} ahorro)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Logística / Fletes:</span>
            <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
              {formatUsd(logisticsExpense)}{" "}
              {logisticsCount > 0 && (
                <span className="text-muted-foreground text-[10px]">
                  ({logisticsCount} gasto{logisticsCount === 1 ? "" : "s"})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-dashed pt-1 font-medium">
            <span className="text-muted-foreground">Total Costos Lote:</span>
            <span className="font-mono font-bold text-foreground">
              {formatUsd(totalRealCost)} USD
            </span>
          </div>
        </div>
      </div>

      {/* 2. Recaudación de Clientes (con porcentaje al lado de la barra de progreso) */}
      <div className="rounded-xl border bg-card p-3.5 text-card-foreground shadow-2xs flex flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Recaudación de Clientes
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-foreground">
            {formatUsd(totalCollected)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / {formatUsd(totalSalePrice)} USD
            </span>
          </p>
        </div>

        {/* Barra de progreso de recolección con porcentaje al lado */}
        <div className="mt-2 border-t pt-1.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  collectionPercentage >= 100
                    ? "bg-emerald-500"
                    : collectionPercentage > 50
                      ? "bg-blue-500"
                      : "bg-amber-500"
                }`}
                style={{ width: `${collectionPercentage}%` }}
              />
            </div>
            <span className="font-mono font-bold text-xs text-foreground shrink-0">
              {collectionPercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Por cobrar:</span>
            <span
              className={`font-mono font-medium ${
                pendingToCollect === 0
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-amber-600 dark:text-amber-400 font-semibold"
              }`}
            >
              {pendingToCollect === 0 ? "Completado" : `${formatUsd(pendingToCollect)} USD`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Ganancia Real Neta (Limpia) */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-3.5 text-card-foreground shadow-2xs flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Ganancia Real Neta
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatUsd(realProfit)} USD
          </p>
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground border-t border-emerald-500/20 pt-1.5 flex items-center justify-between">
          <span>Venta total clientes:</span>
          <span className="font-mono font-medium text-foreground">
            {formatUsd(totalSalePrice)} USD
          </span>
        </div>
      </div>
    </div>
  )
}
