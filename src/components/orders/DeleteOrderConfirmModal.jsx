import * as React from "react"
import { AlertTriangle, Trash2, Loader2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { customerOrdersService } from "@/services/customer-orders.service"
import { formatUsd } from "@/components/orders/order-constants"

/**
 * Modal de confirmación para eliminar un pedido de cliente.
 * Evalúa `order.total_paid_usd` para determinar si el pedido tiene pagos
 * y presentar una advertencia destructiva de alto riesgo.
 */
export function DeleteOrderConfirmModal({
  order,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  error = null,
}) {
  const [checkingPayments, setCheckingPayments] = React.useState(false)
  const [freshOrderData, setFreshOrderData] = React.useState(null)

  // Si `order.total_paid_usd` no viene en el listado, consultamos el detalle para asegurar el monto exacto
  React.useEffect(() => {
    let active = true

    if (open && order?.id) {
      if (order.total_paid_usd !== undefined && order.total_paid_usd !== null) {
        setFreshOrderData(order)
        setCheckingPayments(false)
      } else {
        setCheckingPayments(true)
        customerOrdersService
          .getById(order.id, { include_payments: "true" })
          .then((res) => {
            if (active && res?.data) {
              setFreshOrderData(res.data)
            }
          })
          .catch(() => {
            // Si falla la consulta adicional, fallback al objeto orden original
            if (active) setFreshOrderData(order)
          })
          .finally(() => {
            if (active) setCheckingPayments(false)
          })
      }
    } else {
      setFreshOrderData(null)
      setCheckingPayments(false)
    }

    return () => {
      active = false
    }
  }, [open, order])

  if (!order) return null

  const resolvedOrder = freshOrderData || order
  const totalPaidUsd = Number(resolvedOrder?.total_paid_usd || 0)
  const hasPayments = totalPaidUsd > 0
  const garmentsCount = resolvedOrder?.products?.length ?? 0
  const customerName =
    resolvedOrder?.customer_name ||
    resolvedOrder?.customer?.name ||
    `Cliente #${resolvedOrder?.customer_id}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                hasPayments
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {hasPayments
                  ? "¿Eliminar pedido con pagos registrados?"
                  : "¿Eliminar pedido?"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pedido #{order.id} • {customerName}
                {garmentsCount > 0 && ` • ${garmentsCount} prenda(s)`}
              </p>
            </div>
          </div>

          <DialogDescription className="sr-only">
            Confirmación para eliminar pedido #{order.id}
          </DialogDescription>
        </DialogHeader>

        {checkingPayments ? (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Verificando historial de pagos del pedido...</span>
          </div>
        ) : hasPayments ? (
          /* Advertencia destructiva de alto riesgo (con pagos) */
          <div className="space-y-3 py-1">
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-900 dark:text-rose-200">
              <div className="flex items-start gap-2.5">
                <DollarSign className="size-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-700 dark:text-rose-300">
                    Atención: Pagos asociados detectados
                  </p>
                  <p className="leading-relaxed">
                    Este pedido cuenta con{" "}
                    <strong className="font-bold underline decoration-rose-500/50">
                      ${formatUsd(totalPaidUsd)} USD
                    </strong>{" "}
                    en pagos registrados. Al eliminarlo, los pagos también serán
                    eliminados del historial y balance de caja.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta acción eliminará el pedido, sus prendas asociadas y todos los
              ingresos registrados por concepto de este pedido en cascada. No se
              puede deshacer.
            </p>
          </div>
        ) : (
          /* Diálogo estándar (sin pagos) */
          <div className="py-2 text-xs text-muted-foreground leading-relaxed">
            Esta acción eliminará el pedido y sus productos asociados. No se puede
            deshacer.
          </div>
        )}

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
            disabled={loading || checkingPayments}
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
                <span>
                  {hasPayments ? "Eliminar pedido y pagos" : "Eliminar"}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

