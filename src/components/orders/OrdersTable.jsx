import {
  Eye,
  Pencil,
  Trash2,
  ShoppingCart,
  Package,
  Banknote,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DeliveryStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/OrderStatusBadges"
import {
  formatUsd,
  DEFAULT_ORDER_VISIBLE_COLUMNS,
} from "@/components/orders/order-constants"

export function OrdersTable({
  orders,
  loading,
  visibleColumns = DEFAULT_ORDER_VISIBLE_COLUMNS,
  onViewDetail,
  onPay,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando órdenes de clientes...
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <ShoppingCart className="size-8 text-muted-foreground/50" />
        <p>No se encontraron órdenes con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas apiladas (< md) */}
      <div className="divide-y md:hidden">
        {orders.map((order) => {
          const itemCount = order.products?.length ?? 0
          return (
            <div key={order.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      #{order.id}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {order.customer_name || `Cliente #${order.customer_id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Package className="size-3" />
                    {order.supplier_order_code ? (
                      <span className="font-mono font-medium text-foreground">
                        Lote {order.supplier_order_code}
                      </span>
                    ) : (
                      <span>Sin lote asignado</span>
                    )}
                    <span>• {itemCount} prenda(s)</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <DeliveryStatusBadge status={order.delivery_status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-md border p-2 text-center text-xs">
                <div>
                  <span className="block text-[10px] text-muted-foreground">Costo</span>
                  <span className="font-medium">
                    {formatUsd(order.total_base_cost_usd)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground">Venta</span>
                  <span className="font-semibold">
                    {formatUsd(order.total_sale_price_usd)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground">Ganancia</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatUsd(order.profit_usd)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => onViewDetail(order)}
                  >
                    <Eye className="size-3.5" />
                    Prendas ({itemCount})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() => onPay(order)}
                  >
                    <Banknote className="size-3.5" />
                    Pagar
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Editar estado o lote"
                    onClick={() => onEdit(order)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    title="Eliminar orden"
                    onClick={() => onDelete(order)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.orderId !== false && (
                <TableHead className="w-20">Orden</TableHead>
              )}
              {visibleColumns.customer !== false && (
                <TableHead>Cliente</TableHead>
              )}
              {visibleColumns.supplierOrder !== false && (
                <TableHead>Lote Proveedor</TableHead>
              )}
              {visibleColumns.itemCount !== false && (
                <TableHead>Prendas</TableHead>
              )}
              {visibleColumns.baseCost !== false && (
                <TableHead>Costo</TableHead>
              )}
              {visibleColumns.salePrice !== false && (
                <TableHead>Venta</TableHead>
              )}
              {visibleColumns.profit !== false && (
                <TableHead>Ganancia</TableHead>
              )}
              {visibleColumns.deliveryStatus !== false && (
                <TableHead>Entrega</TableHead>
              )}
              {visibleColumns.paymentStatus !== false && (
                <TableHead>Pago</TableHead>
              )}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const itemCount = order.products?.length ?? 0
              return (
                <TableRow key={order.id}>
                  {visibleColumns.orderId !== false && (
                    <TableCell className="font-mono text-xs font-semibold">
                      #{order.id}
                    </TableCell>
                  )}
                  {visibleColumns.customer !== false && (
                    <TableCell className="font-medium text-foreground">
                      {order.customer_name || `Cliente #${order.customer_id}`}
                    </TableCell>
                  )}
                  {visibleColumns.supplierOrder !== false && (
                    <TableCell>
                      {order.supplier_order_code ? (
                        <Badge variant="secondary" className="font-mono">
                          {order.supplier_order_code}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin lote
                        </span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.itemCount !== false && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs font-medium"
                        onClick={() => onViewDetail(order)}
                      >
                        <Eye className="size-3.5 text-primary" />
                        {itemCount} prenda(s)
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.baseCost !== false && (
                    <TableCell className="text-muted-foreground">
                      {formatUsd(order.total_base_cost_usd)}
                    </TableCell>
                  )}
                  {visibleColumns.salePrice !== false && (
                    <TableCell className="font-medium">
                      {formatUsd(order.total_sale_price_usd)}
                    </TableCell>
                  )}
                  {visibleColumns.profit !== false && (
                    <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatUsd(order.profit_usd)}
                    </TableCell>
                  )}
                  {visibleColumns.deliveryStatus !== false && (
                    <TableCell>
                      <DeliveryStatusBadge status={order.delivery_status} />
                    </TableCell>
                  )}
                  {visibleColumns.paymentStatus !== false && (
                    <TableCell>
                      <PaymentStatusBadge status={order.payment_status} />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-600 hover:bg-emerald-500/10"
                        title="Realizar pago del pedido"
                        onClick={() => onPay(order)}
                      >
                        <Banknote className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver y gestionar prendas"
                        onClick={() => onViewDetail(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar estado o lote"
                        onClick={() => onEdit(order)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar orden"
                        onClick={() => onDelete(order)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
