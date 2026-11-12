import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DELIVERY_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/components/orders/order-constants"

export function OrderEditDialog({
  open,
  onOpenChange,
  order = null,
  customers = [],
  supplierOrders = [],
  onSubmit,
  saving = false,
  error = null,
}) {
  const [customerId, setCustomerId] = React.useState("")
  const [supplierOrderId, setSupplierOrderId] = React.useState("")
  const [deliveryStatus, setDeliveryStatus] = React.useState("PENDING")
  const [paymentStatus, setPaymentStatus] = React.useState("UNPAID")

  React.useEffect(() => {
    if (order) {
      setCustomerId(String(order.customer_id ?? ""))
      setSupplierOrderId(
        order.supplier_order_id ? String(order.supplier_order_id) : ""
      )
      setDeliveryStatus(order.delivery_status || "PENDING")
      setPaymentStatus(order.payment_status || "UNPAID")
    }
  }, [order, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      customer_id: Number(customerId),
      supplier_order_id: supplierOrderId ? Number(supplierOrderId) : null,
      delivery_status: deliveryStatus,
      payment_status: paymentStatus,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Orden #{order?.id}</DialogTitle>
          <DialogDescription>
            Actualiza el lote asignado, estado de entrega o estado de pago del pedido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-order-customer">Cliente</Label>
            <select
              id="edit-order-customer"
              required
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.reference ? `(${c.reference})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-order-lot">Lote a Proveedor</Label>
            <select
              id="edit-order-lot"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
              value={supplierOrderId}
              onChange={(e) => setSupplierOrderId(e.target.value)}
            >
              <option value="">Sin lote asignado</option>
              {supplierOrders.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  Lote {lot.code} ({lot.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-order-delivery">Estado Entrega</Label>
              <select
                id="edit-order-delivery"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
              >
                {DELIVERY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-order-payment">Estado Pago</Label>
              <select
                id="edit-order-payment"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

