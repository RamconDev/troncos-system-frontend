import * as React from "react"
import {
  Plus,
  Package,
  Banknote,
  Boxes,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react"
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
import {
  formatUsd,
  ORDER_PRODUCTS_COLUMNS_CONFIG,
  DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS,
} from "@/components/orders/order-constants"
import { ColumnVisibilityDropdown } from "@/components/common/ColumnVisibilityDropdown"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"
import { customerOrdersService } from "@/services/customer-orders.service"
import { productsService } from "@/services/products.service"

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
  onOrderUpdated,
  onOpenPay,
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

  const [productVisibleColumns, setProductVisibleColumns] = React.useState(() => {
    try {
      const saved = localStorage.getItem("order_products_columns_v1")
      if (saved) {
        return { ...DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS, ...JSON.parse(saved) }
      }
    } catch (_) {}
    return DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS
  })

  const handleToggleProductColumn = (columnId) => {
    setProductVisibleColumns((prev) => {
      const next = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem("order_products_columns_v1", JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  const handleResetProductColumns = () => {
    setProductVisibleColumns(DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS)
    try {
      localStorage.setItem(
        "order_products_columns_v1",
        JSON.stringify(DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS)
      )
    } catch (_) {}
  }

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
          <SheetDescription className="flex flex-wrap items-center justify-between gap-2 pt-1">
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

            {order && onOpenPay && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                onClick={() => onOpenPay(order)}
              >
                <Banknote className="size-3.5" />
                Realizar Pago
              </Button>
            )}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Consolidado Financiero de la Orden */}
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

        {/* Encabezado de la Sección de Prendas */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold">
            Prendas en la Orden ({products.length})
          </h3>
          <div className="flex items-center gap-2">
            <ColumnVisibilityDropdown
              columns={ORDER_PRODUCTS_COLUMNS_CONFIG}
              visibleColumns={productVisibleColumns}
              onToggleColumn={handleToggleProductColumn}
              onResetColumns={handleResetProductColumns}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              className="h-8 text-xs"
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
        </div>

        {/* Lista Compacta de Prendas */}
        <div className="px-4 pb-6 sm:px-6">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando prendas...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
              <Boxes className="size-6 text-muted-foreground/40" />
              <p>No hay prendas cargadas en esta orden.</p>
            </div>
          ) : (
            <div className="grid gap-1.5 rounded-md border bg-muted/20 p-2.5 text-xs">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 pb-1.5 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Boxes className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate text-foreground">
                      {prod.name}
                    </span>
                    {productVisibleColumns.size !== false && (
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {prod.size || "—"}
                      </Badge>
                    )}
                    {productVisibleColumns.notes !== false && prod.notes && (
                      <span
                        className="text-muted-foreground truncate max-w-[200px]"
                        title={prod.notes}
                      >
                        ({prod.notes})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {productVisibleColumns.referenceUrl !== false && prod.reference_url && (
                      <a
                        href={prod.reference_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline text-[11px]"
                      >
                        <ExternalLink className="size-3" />
                        Yupoo
                      </a>
                    )}
                    {productVisibleColumns.baseCost !== false && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Costo: {formatUsd(prod.base_cost)}
                      </span>
                    )}
                    {productVisibleColumns.salePrice !== false && (
                      <span className="font-mono font-semibold text-foreground text-xs">
                        Venta: {formatUsd(prod.sale_price)}
                      </span>
                    )}
                    <div className="flex items-center gap-0.5 ml-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Editar prenda"
                        onClick={() => {
                          setEditingProduct(prod)
                          setProdFormError(null)
                          setProdFormOpen(true)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar prenda"
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(prod)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
