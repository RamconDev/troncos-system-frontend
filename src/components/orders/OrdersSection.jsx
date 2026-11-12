import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PaginationBar } from "@/components/common/PaginationBar"
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"
import { OrdersTable } from "@/components/orders/OrdersTable"
import { OrderCreateDialog } from "@/components/orders/OrderCreateDialog"
import { OrderEditDialog } from "@/components/orders/OrderEditDialog"
import { OrderDetailSheet } from "@/components/orders/OrderDetailSheet"
import {
  DELIVERY_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/components/orders/order-constants"
import { customerOrdersService } from "@/services/customer-orders.service"
import { customersService } from "@/services/customers.service"
import { supplierOrdersService } from "@/services/supplier-orders.service"

export function OrdersSection({ defaultOpenCreate = false }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = React.useState([])
  const [customers, setCustomers] = React.useState([])
  const [supplierOrders, setSupplierOrders] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)

  const [customerFilter, setCustomerFilter] = React.useState(
    () => searchParams.get("customer_id") || ""
  )
  const [supplierOrderFilter, setSupplierOrderFilter] = React.useState(
    () => searchParams.get("supplier_order_id") || ""
  )
  const [deliveryFilter, setDeliveryFilter] = React.useState("")
  const [paymentFilter, setPaymentFilter] = React.useState("")
  const [unassignedOnly, setUnassignedOnly] = React.useState(false)

  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [createOpen, setCreateOpen] = React.useState(defaultOpenCreate)
  const [editingOrder, setEditingOrder] = React.useState(null)
  const [detailOrderId, setDetailOrderId] = React.useState(() =>
    searchParams.get("order_id") ? Number(searchParams.get("order_id")) : null
  )
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const loadCatalogs = React.useCallback(async () => {
    const [custRes, lotRes] = await Promise.allSettled([
      customersService.getAll(),
      supplierOrdersService.getAll(),
    ])
    if (custRes.status === "fulfilled" && Array.isArray(custRes.value.data)) {
      setCustomers(custRes.value.data)
    }
    if (lotRes.status === "fulfilled" && Array.isArray(lotRes.value.data)) {
      setSupplierOrders(lotRes.value.data)
    }
  }, [])

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await customerOrdersService.getPaginated({
        page,
        per_page: 10,
        customer_id: customerFilter,
        supplier_order_id: unassignedOnly ? undefined : supplierOrderFilter,
        unassigned_only: unassignedOnly ? "true" : undefined,
        delivery_status: deliveryFilter,
        payment_status: paymentFilter,
        include_products: "true",
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    customerFilter,
    supplierOrderFilter,
    unassignedOnly,
    deliveryFilter,
    paymentFilter,
  ])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  React.useEffect(() => {
    loadCatalogs()
  }, [loadCatalogs])

  const handleCreateOrder = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      await customerOrdersService.create(payload)
      setCreateOpen(false)
      fetchOrders()
    } catch (err) {
      setFormError(err.friendlyMessage || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateOrder = async (payload) => {
    if (!editingOrder) return
    setSaving(true)
    setFormError(null)
    try {
      await customerOrdersService.update(editingOrder.id, payload)
      setEditingOrder(null)
      fetchOrders()
    } catch (err) {
      setFormError(err.friendlyMessage || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await customerOrdersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchOrders()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setPage(1)
    setCustomerFilter("")
    setSupplierOrderFilter("")
    setDeliveryFilter("")
    setPaymentFilter("")
    setUnassignedOnly(false)
    setSearchParams({})
  }

  const hasActiveFilters = Boolean(
    customerFilter ||
      supplierOrderFilter ||
      deliveryFilter ||
      paymentFilter ||
      unassignedOnly
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle>Órdenes de Clientes</CardTitle>
          <CardDescription>
            Gestiona los pedidos, sus prendas anidadas, estados de entrega/pago y asignación a lotes.
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => {
            setFormError(null)
            setCreateOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nueva Orden
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Barra de Filtros Responsiva */}
        <div className="flex flex-col gap-2.5 border-y px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-6">
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-48"
            value={customerFilter}
            onChange={(e) => {
              setPage(1)
              setCustomerFilter(e.target.value)
            }}
          >
            <option value="">Todos los clientes</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-44"
            disabled={unassignedOnly}
            value={supplierOrderFilter}
            onChange={(e) => {
              setPage(1)
              setSupplierOrderFilter(e.target.value)
            }}
          >
            <option value="">Todos los lotes</option>
            {supplierOrders.map((lot) => (
              <option key={lot.id} value={lot.id}>
                Lote {lot.code}
              </option>
            ))}
          </select>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-40"
            value={deliveryFilter}
            onChange={(e) => {
              setPage(1)
              setDeliveryFilter(e.target.value)
            }}
          >
            <option value="">Entrega: Todos</option>
            {DELIVERY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-40"
            value={paymentFilter}
            onChange={(e) => {
              setPage(1)
              setPaymentFilter(e.target.value)
            }}
          >
            <option value="">Pago: Todos</option>
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1">
            <input
              type="checkbox"
              className="size-4 accent-primary rounded"
              checked={unassignedOnly}
              onChange={(e) => {
                setPage(1)
                setUnassignedOnly(e.target.checked)
              }}
            />
            <span>Solo sin lote asignado</span>
          </label>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs"
              onClick={clearFilters}
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>

        {listError && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {listError}
          </div>
        )}

        <OrdersTable
          orders={items}
          loading={loading}
          onViewDetail={(order) => setDetailOrderId(order.id)}
          onEdit={(order) => {
            setFormError(null)
            setEditingOrder(order)
          }}
          onDelete={(order) => {
            setDeleteError(null)
            setDeleteTarget(order)
          }}
        />

        <PaginationBar meta={meta} onPageChange={setPage} />
      </CardContent>

      <OrderCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        supplierOrders={supplierOrders}
        defaultCustomerId={customerFilter}
        saving={saving}
        error={formError}
        onSubmit={handleCreateOrder}
      />

      <OrderEditDialog
        open={Boolean(editingOrder)}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        order={editingOrder}
        customers={customers}
        supplierOrders={supplierOrders}
        saving={saving}
        error={formError}
        onSubmit={handleUpdateOrder}
      />

      <OrderDetailSheet
        orderId={detailOrderId}
        open={Boolean(detailOrderId)}
        onOpenChange={(open) => !open && setDetailOrderId(null)}
        onOrderUpdated={fetchOrders}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar Orden de Cliente"
        description={`¿Estás seguro de eliminar la Orden #${deleteTarget?.id} de "${deleteTarget?.customer_name || ""}"? Se eliminarán en cascada todas sus prendas.`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

