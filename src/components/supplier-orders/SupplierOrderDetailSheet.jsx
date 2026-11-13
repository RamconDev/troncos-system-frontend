import * as React from "react"
import { Link } from "react-router-dom"
import {
  ExternalLink,
  Unlink,
  PlusCircle,
  ShoppingCart,
  Boxes,
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
import { SupplierOrderStatusBadge } from "@/components/supplier-orders/SupplierOrderStatusBadge"
import { TrackingCodesStatusList } from "@/components/supplier-orders/TrackingCodesStatusList"
import { formatShortDate } from "@/components/supplier-orders/supplier-order-constants"
import {
  DeliveryStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/OrderStatusBadges"
import { formatUsd } from "@/components/orders/order-constants"
import { supplierOrdersService } from "@/services/supplier-orders.service"
import { customerOrdersService } from "@/services/customer-orders.service"

export function SupplierOrderDetailSheet({
  lotId,
  open,
  onOpenChange,
  onLotUpdated,
}) {
  const [lot, setLot] = React.useState(null)
  const [unassignedOrders, setUnassignedOrders] = React.useState([])
  const [selectedToLink, setSelectedToLink] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const [error, setError] = React.useState(null)

  const loadDetail = React.useCallback(async () => {
    if (!lotId) return
    setLoading(true)
    setError(null)
    try {
      const [lotRes, unassignedRes] = await Promise.all([
        supplierOrdersService.getById(lotId),
        customerOrdersService.getAll({ unassigned_only: "true" }),
      ])
      setLot(lotRes.data)
      setUnassignedOrders(
        Array.isArray(unassignedRes.data) ? unassignedRes.data : []
      )
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [lotId])

  React.useEffect(() => {
    if (open && lotId) {
      loadDetail()
    }
  }, [open, lotId, loadDetail])

  const handleLinkOrder = async () => {
    if (!selectedToLink || !lot) return
    setUpdating(true)
    setError(null)
    try {
      await customerOrdersService.update(Number(selectedToLink), {
        supplier_order_id: lot.id,
      })
      setSelectedToLink("")
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleUnlinkOrder = async (orderId) => {
    setUpdating(true)
    setError(null)
    try {
      await customerOrdersService.update(orderId, {
        supplier_order_id: null,
      })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleAutoMarkLotDelivered = async () => {
    if (!lot || lot.status === "DELIVERED" || lot.status === "RECEIVED") return
    setUpdating(true)
    setError(null)
    try {
      await supplierOrdersService.update(lot.id, { status: "DELIVERED" })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkLotReceivedInHand = async () => {
    if (!lot || lot.status === "RECEIVED") return
    setUpdating(true)
    setError(null)
    try {
      await supplierOrdersService.update(lot.id, { status: "RECEIVED" })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const customerOrders = lot?.customer_orders || []

  const summary = customerOrders.reduce(
    (acc, ord) => {
      acc.orders += 1
      acc.garments += ord.products?.length ?? 0
      acc.baseCost += Number(ord.total_base_cost_usd || 0)
      acc.salePrice += Number(ord.total_sale_price_usd || 0)
      acc.profit += Number(ord.profit_usd || 0)
      return acc
    },
    { orders: 0, garments: 0, baseCost: 0, salePrice: 0, profit: 0 }
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <SheetTitle className="font-mono">
              Lote {lot?.code || `#${lotId}`}
            </SheetTitle>
            {lot && <SupplierOrderStatusBadge status={lot.status} />}
          </div>
          <SheetDescription className="flex flex-col gap-1.5 pt-1 text-xs">
            <span>
              Creado: {formatShortDate(lot?.created_at)}{" "}
              {lot?.notes ? `• ${lot.notes}` : ""}
            </span>
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Lista de Códigos de Rastreo con Indicador de Estado por Guía */}
        {lot && (
          <TrackingCodesStatusList
            trackingCode={lot.tracking_code}
            trackingItems={lot.trackings}
            lotStatus={lot.status}
            onAllPackagesDelivered={handleAutoMarkLotDelivered}
          />
        )}

        {/* Banner cuando todos los paquetes ya fueron entregados en Colombia y están listos para recoger */}
        {lot?.status === "DELIVERED" && (
          <div className="flex flex-col gap-2 border-b bg-purple-500/10 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium text-purple-800 dark:text-purple-300">
              Todos los paquetes de este lote figuran como{" "}
              <strong>Entregados en Colombia</strong>. Cuando ya los hayas retirado
              y estén en tus manos, márcalo como Recibido:
            </span>
            <Button
              size="sm"
              disabled={updating}
              onClick={handleMarkLotReceivedInHand}
              className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Marcar como Recibido (En mis manos)
            </Button>
          </div>
        )}

        {/* Consolidado del Lote */}
        <div className="grid grid-cols-2 gap-2 border-b bg-muted/30 px-4 py-3 text-center text-xs sm:grid-cols-4 sm:px-6">
          <div>
            <span className="block text-muted-foreground">Total Prendas</span>
            <strong className="text-sm font-semibold">
              {summary.garments} uds ({summary.orders} pedidos)
            </strong>
          </div>
          <div>
            <span className="block text-muted-foreground">Costo Proveedor</span>
            <strong className="text-sm font-semibold">
              {formatUsd(summary.baseCost)}
            </strong>
          </div>
          <div>
            <span className="block text-muted-foreground">Venta Total</span>
            <strong className="text-sm font-semibold">
              {formatUsd(summary.salePrice)}
            </strong>
          </div>
          <div>
            <span className="block text-muted-foreground">Ganancia Lote</span>
            <strong className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatUsd(summary.profit)}
            </strong>
          </div>
        </div>

        {/* Barra Rápida para Agregar Orden Sin Lote */}
        <div className="flex flex-col gap-2 border-b bg-background px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <select
            className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-xs shadow-xs outline-none"
            value={selectedToLink}
            onChange={(e) => setSelectedToLink(e.target.value)}
          >
            <option value="">
              + Agregar una orden pendiente a este lote ({unassignedOrders.length} disponibles)...
            </option>
            {unassignedOrders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                Orden #{ord.id} — {ord.customer_name || `Cliente #${ord.customer_id}`} (
                {ord.products?.length ?? 0} prendas • Costo{" "}
                {formatUsd(ord.total_base_cost_usd)})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!selectedToLink || updating}
            onClick={handleLinkOrder}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="size-4" />
            Vincular al Lote
          </Button>
        </div>

        {/* Lista de Órdenes y Prendas dentro del Lote */}
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando órdenes del lote...
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <ShoppingCart className="size-8 text-muted-foreground/50" />
              <p>Este lote aún no tiene órdenes de clientes vinculadas.</p>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div key={ord.id} className="flex flex-col gap-3 p-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/pedidos?order_id=${ord.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline"
                    >
                      Orden #{ord.id}
                    </Link>
                    <span className="font-semibold text-sm">
                      {ord.customer_name || `Cliente #${ord.customer_id}`}
                    </span>
                    <DeliveryStatusBadge status={ord.delivery_status} />
                    <PaymentStatusBadge status={ord.payment_status} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Costo: <strong>{formatUsd(ord.total_base_cost_usd)}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updating}
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      title="Desvincular orden de este lote"
                      onClick={() => handleUnlinkOrder(ord.id)}
                    >
                      <Unlink className="size-3.5" />
                      Quitar
                    </Button>
                  </div>
                </div>

                {/* Prendas de la orden */}
                {ord.products?.length > 0 ? (
                  <div className="grid gap-1.5 rounded-md border bg-muted/20 p-2.5 text-xs">
                    {ord.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 pb-1.5 last:pb-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Boxes className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">
                            {prod.name}
                          </span>
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {prod.size || "—"}
                          </Badge>
                          {prod.notes && (
                            <span className="text-muted-foreground truncate">
                              ({prod.notes})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {prod.reference_url && (
                            <a
                              href={prod.reference_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              Yupoo
                            </a>
                          )}
                          <span className="font-mono text-muted-foreground">
                            {formatUsd(prod.base_cost)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin prendas cargadas en esta orden.
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
