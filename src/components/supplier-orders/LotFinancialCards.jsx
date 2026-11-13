import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/components/orders/order-constants"

/**
 * Tarjetas de métricas financieras del lote según SPEC 4.1:
 * - Card 1: estimated_base_cost_usd
 * - Card 2: supplier_payment_usd + Badge (PAGADO / PENDIENTE) + supplier_discount_usd
 * - Card 3: logistics_expense_usd
 * - Card 4: real_profit_usd (Highlight) + total_sale_price_usd
 */
export function LotFinancialCards({ summary }) {
  if (!summary) return null

  const estimatedBaseCost = Number(summary.estimated_base_cost_usd || 0)
  const hasRealPayment = Boolean(summary.has_real_supplier_payment)
  const supplierPayment = Number(summary.supplier_payment_usd || 0)
  const supplierDiscount = Number(summary.supplier_discount_usd || 0)
  const logisticsExpense = Number(summary.logistics_expense_usd || 0)
  const totalSalePrice = Number(summary.total_sale_price_usd || 0)
  const realProfit = Number(summary.real_profit_usd || 0)

  return (
    <div className="grid grid-cols-1 gap-3 border-b bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
      {/* 1. Costo Estimado Base */}
      <div className="rounded-xl border bg-card p-3.5 text-card-foreground shadow-2xs">
        <p className="text-xs font-medium text-muted-foreground">
          Costo Estimado Base
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-foreground">
          {formatUsd(estimatedBaseCost)} USD
        </p>
        <span className="text-[11px] text-muted-foreground">
          Suma de precios base de prendas
        </span>
      </div>

      {/* 2. Pago Real Proveedor */}
      <div className="rounded-xl border bg-card p-3.5 text-card-foreground shadow-2xs">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Pago Proveedor Real
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
          {hasRealPayment ? `${formatUsd(supplierPayment)} USD` : "—"}
        </p>
        {hasRealPayment ? (
          <span
            className={`font-mono text-[11px] font-semibold ${
              supplierDiscount >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {supplierDiscount >= 0
              ? `+${formatUsd(supplierDiscount)} de ahorro`
              : `-${formatUsd(Math.abs(supplierDiscount))} de sobrecosto`}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            Calculado con precio base
          </span>
        )}
      </div>

      {/* 3. Gastos de Logística */}
      <div className="rounded-xl border bg-card p-3.5 text-card-foreground shadow-2xs">
        <p className="text-xs font-medium text-muted-foreground">
          Logística / Fletes
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-rose-600 dark:text-rose-400">
          {formatUsd(logisticsExpense)} USD
        </p>
        <span className="text-[11px] text-muted-foreground">
          Envíos, encomiendas y traslados
        </span>
      </div>

      {/* 4. Ganancia Real Neta */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-3.5 text-card-foreground shadow-2xs">
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Ganancia Real Neta
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatUsd(realProfit)} USD
        </p>
        <span className="text-[11px] text-muted-foreground">
          Venta total: {formatUsd(totalSalePrice)} USD
        </span>
      </div>
    </div>
  )
}

