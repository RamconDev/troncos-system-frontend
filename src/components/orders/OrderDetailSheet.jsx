import * as React from "react"
import { Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DeliveryStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/OrderStatusBadges"
import { formatUsd } from "@/components/orders/order-constants"
import { ProductsTable } from "@/components/products/ProductsTable"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"
import { customerOrdersService } from "@/services/customer-orders.service"
import { productsService } from "@/services/products.service"

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
  onOrderUpdated,
}) {
  const [order, setOrder] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const [prodFormOpen, setProdFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState(null)
  const [savingProduct, setSavingProduct] = React.useState(false)
  const [prodFormError, setProdFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const loadOrderDetail = React.useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const res = await customerOrdersService.getById(orderId)
      setOrder(res.data)
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  React.useEffect(() => {
    if (open && orderId) {
      loadOrderDetail()
    }
  }, [open, orderId, loadOrderDetail])

  const handleSaveProduct = async (payload) => {
    setSavingProduct(true)
    setProdFormError(null)
    try {
      if (editingProduct?.id) {
        await productsService.update(editingProduct.id, payload)
      } else {
        await productsService.create(payload)
      }
      setProdFormOpen(false)
      setEditingProduct(null)
      await loadOrderDetail()
      onOrderUpdated?.()
    } catch (err) {
      setProdFormError(err.friendlyMessage || err.message)
    } finally {
      setSavingProduct(false)
    }
  }

  const handleConfirmDeleteProduct = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await productsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await loadOrderDetail()
      onOrderUpdated?.()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const products = order?.products || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <SheetTitle>
              Orden #{order?.id || orderId} — {order?.customer_name || "Cliente"}
            </SheetTitle>
            <div className="flex items-center gap-1.5">
              {order && (
                <>
                  <DeliveryStatusBadge status={order.delivery_status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </>
              )}
            </div>
          </div>
          <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs">
              <Package className="size-3.5" />
              Lote:{" "}
              {order?.supplier_order_code ? (
                <Badge variant="secondary" className="font-mono">
                  {order.supplier_order_code}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </span>
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {order && (
          <div className="grid grid-cols-3 gap-2 border-b bg-muted/30 px-4 py-3 text-center text-xs sm:px-6">
            <div>
              <span className="block text-muted-foreground">Costo Base</span>
              <strong className="text-sm font-semibold">
                {formatUsd(order.total_base_cost_usd)}
              </strong>
            </div>
            <div>
              <span className="block text-muted-foreground">Total Venta</span>
              <strong className="text-sm font-semibold">
                {formatUsd(order.total_sale_price_usd)}
              </strong>
            </div>
            <div>
              <span className="block text-muted-foreground">Ganancia (USD)</span>
              <strong className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {formatUsd(order.profit_usd)}
              </strong>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Prendas en la Orden ({products.length})
          </h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null)
              setProdFormError(null)
              setProdFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Agregar Prenda
          </Button>
        </div>

        <div className="border-t">
          <ProductsTable
            products={products}
            loading={loading}
            hideOrderColumn
            onEdit={(prod) => {
              setEditingProduct(prod)
              setProdFormError(null)
              setProdFormOpen(true)
            }}
            onDelete={(prod) => {
              setDeleteError(null)
              setDeleteTarget(prod)
            }}
          />
        </div>

        <ProductFormDialog
          open={prodFormOpen}
          onOpenChange={setProdFormOpen}
          initialData={editingProduct}
          fixedOrderId={orderId}
          saving={savingProduct}
          error={prodFormError}
          onSubmit={handleSaveProduct}
        />

        <ConfirmDeleteDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Quitar Prenda de la Orden"
          description={`¿Deseas eliminar "${deleteTarget?.name}" de esta orden?`}
          error={deleteError}
          loading={deleting}
          onConfirm={handleConfirmDeleteProduct}
        />
      </SheetContent>
    </Sheet>
  )
}

