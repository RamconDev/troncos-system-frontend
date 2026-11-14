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
import { ColumnVisibilityDropdown } from "@/components/common/ColumnVisibilityDropdown"
import { SupplierOrdersTable } from "@/components/supplier-orders/SupplierOrdersTable"
import { SupplierOrderFormDialog } from "@/components/supplier-orders/SupplierOrderFormDialog"
import { SupplierOrderDetailSheet } from "@/components/supplier-orders/SupplierOrderDetailSheet"
import { GlobalTrackingSyncButton } from "@/components/tracking/GlobalTrackingSyncButton"
import {
  SUPPLIER_ORDER_STATUS_OPTIONS,
  SUPPLIER_ORDER_COLUMNS_CONFIG,
  DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS,
} from "@/components/supplier-orders/supplier-order-constants"
import { supplierOrdersService } from "@/services/supplier-orders.service"

export function SupplierOrdersSection() {
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingLot, setEditingLot] = React.useState(null)
  const [detailLotId, setDetailLotId] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const [visibleColumns, setVisibleColumns] = React.useState(() => {
    try {
      const saved = localStorage.getItem("supplier_orders_table_columns_v1")
      if (saved) {
        return { ...DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS, ...JSON.parse(saved) }
      }
    } catch (_) {}
    return DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS
  })

  const handleToggleColumn = (columnId) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem(
          "supplier_orders_table_columns_v1",
          JSON.stringify(next)
        )
      } catch (_) {}
      return next
    })
  }

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS)
    try {
      localStorage.setItem(
        "supplier_orders_table_columns_v1",
        JSON.stringify(DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS)
      )
    } catch (_) {}
  }

  const fetchLots = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await supplierOrdersService.getPaginated({
        page,
        per_page: 10,
        search,
        status: statusFilter,
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  React.useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingLot?.id) {
        await supplierOrdersService.update(editingLot.id, payload)
      } else {
        await supplierOrdersService.create(payload)
      }
      setFormOpen(false)
      setEditingLot(null)
      fetchLots()
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
      await supplierOrdersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchLots()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const hasFilters = Boolean(search || statusFilter)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle>Lotes / Órdenes a Proveedor</CardTitle>
          <CardDescription>
            Agrupa los pedidos de clientes en lotes de compra, asigna códigos de seguimiento y monitorea el tránsito.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <GlobalTrackingSyncButton onSyncSuccess={fetchLots} />
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingLot(null)
              setFormError(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo Lote
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-2.5 border-y px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código, guía o notas..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-48"
            value={statusFilter}
            onChange={(e) => {
              setPage(1)
              setStatusFilter(e.target.value)
            }}
          >
            <option value="">Todos los estados</option>
            {SUPPLIER_ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
                setStatusFilter("")
              }}
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          )}

          <div className="w-full sm:w-auto sm:ml-auto">
            <ColumnVisibilityDropdown
              columns={SUPPLIER_ORDER_COLUMNS_CONFIG}
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
              onResetColumns={handleResetColumns}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {listError && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {listError}
          </div>
        )}

        <SupplierOrdersTable
          lots={items}
          loading={loading}
          visibleColumns={visibleColumns}
          onViewDetail={(lot) => setDetailLotId(lot.id)}
          onEdit={(lot) => {
            setEditingLot(lot)
            setFormError(null)
            setFormOpen(true)
          }}
          onDelete={(lot) => {
            setDeleteError(null)
            setDeleteTarget(lot)
          }}
        />

        <PaginationBar meta={meta} onPageChange={setPage} />
      </CardContent>

      <SupplierOrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingLot}
        saving={saving}
        error={formError}
        onSubmit={handleSave}
      />

      <SupplierOrderDetailSheet
        lotId={detailLotId}
        open={Boolean(detailLotId)}
        onOpenChange={(open) => !open && setDetailLotId(null)}
        onLotUpdated={fetchLots}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar Lote"
        description={`¿Estás seguro de eliminar el lote "${deleteTarget?.code}"? Las órdenes de clientes asociadas no se borrarán, solo quedarán desvinculadas (sin lote).`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

