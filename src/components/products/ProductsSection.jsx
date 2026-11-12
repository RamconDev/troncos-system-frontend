import * as React from "react"
import { Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PaginationBar } from "@/components/common/PaginationBar"
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog"
import { ProductsTable } from "@/components/products/ProductsTable"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { COMMON_SIZES } from "@/components/orders/order-constants"
import { productsService } from "@/services/products.service"
import { customerOrdersService } from "@/services/customer-orders.service"

export function ProductsSection() {
  const [items, setItems] = React.useState([])
  const [ordersList, setOrdersList] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [sizeFilter, setSizeFilter] = React.useState("")
  const [orderIdFilter, setOrderIdFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const loadOrders = React.useCallback(async () => {
    try {
      const res = await customerOrdersService.getAll({ include_products: false })
      setOrdersList(Array.isArray(res.data) ? res.data : [])
    } catch {
      // Silencioso
    }
  }, [])

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await productsService.getPaginated({
        page,
        per_page: 10,
        search,
        size: sizeFilter,
        customer_order_id: orderIdFilter,
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, sizeFilter, orderIdFilter])

  React.useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  React.useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingItem?.id) {
        await productsService.update(editingItem.id, payload)
      } else {
        await productsService.create(payload)
      }
      setFormOpen(false)
      setEditingItem(null)
      fetchProducts()
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
      await productsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const hasFilters = Boolean(search || sizeFilter || orderIdFilter)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle>Prendas y Productos Solicitados</CardTitle>
          <CardDescription>
            Consulta, filtra por talla o pedido y edita el desglose de productos.
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingItem(null)
            setFormError(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Agregar Producto
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-2.5 border-y px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en nombre o estampado..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-40"
            value={sizeFilter}
            onChange={(e) => {
              setPage(1)
              setSizeFilter(e.target.value)
            }}
          >
            <option value="">Todas las tallas</option>
            {COMMON_SIZES.map((s) => (
              <option key={s} value={s}>
                Talla {s}
              </option>
            ))}
          </select>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-56"
            value={orderIdFilter}
            onChange={(e) => {
              setPage(1)
              setOrderIdFilter(e.target.value)
            }}
          >
            <option value="">Todas las órdenes</option>
            {ordersList.map((ord) => (
              <option key={ord.id} value={ord.id}>
                Orden #{ord.id} — {ord.customer_name || `Cliente #${ord.customer_id}`}
              </option>
            ))}
          </select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs"
              onClick={() => {
                setPage(1)
                setSearch("")
                setSizeFilter("")
                setOrderIdFilter("")
              }}
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

        <ProductsTable
          products={items}
          loading={loading}
          onEdit={(item) => {
            setEditingItem(item)
            setFormError(null)
            setFormOpen(true)
          }}
          onDelete={(item) => {
            setDeleteError(null)
            setDeleteTarget(item)
          }}
        />

        <PaginationBar meta={meta} onPageChange={setPage} />
      </CardContent>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        ordersList={ordersList}
        saving={saving}
        error={formError}
        onSubmit={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar Producto"
        description={`¿Estás seguro de eliminar "${deleteTarget?.name}" de la Orden #${deleteTarget?.customer_order_id}?`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

