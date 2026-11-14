import * as React from "react"
import { AlertTriangle, Trash2, Loader2, Unlink, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatUsd } from "@/components/orders/order-constants"

/**
 * Modal de confirmación para eliminar un lote (SupplierOrder).
 * Advierte claramente que los gastos asociados se eliminarán
 * mientras que las órdenes de clientes vinculadas quedarán desvinculadas.
 */
export function DeleteSupplierOrderConfirmModal({
  lot,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  error = null,
}) {
  if (!lot) return null

  const ordersCount =
    lot?.customer_orders?.length ??
    lot?.financial_summary?.ordersCount ??
    0

  const totalExpensesUsd = Number(
    lot?.financial_summary?.total_real_cost_usd ??
      lot?.financial_summary?.supplier_payment_usd ??
      0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                ¿Eliminar lote &quot;{lot.code}&quot;?
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lote #{lot.id} • {lot.status}
              </p>
            </div>
          </div>

          <DialogDescription className="sr-only">
            Confirmación para eliminar lote {lot.code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1 text-xs">
          {/* Tarjeta explicativa de efectos de eliminación */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <Receipt className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Gastos del lote serán eliminados
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Todos los pagos a proveedor y gastos de logística/fletes
                  asociados a este lote
                  {totalExpensesUsd > 0 && ` (~$${formatUsd(totalExpensesUsd)} USD)`}{" "}
                  se eliminarán definitivamente del balance financiero.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 border-t border-amber-500/20 pt-2">
              <Unlink className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Órdenes de clientes quedarán desvinculadas
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Las órdenes de clientes vinculadas a este lote{" "}
                  <strong>no se borrarán</strong>; únicamente quedarán sin lote
                  asignado para que puedas reagruparlas en el futuro.
                </p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Esta acción no se puede deshacer. ¿Deseas proceder con la eliminación?
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
            className="gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Eliminar lote y gastos</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

