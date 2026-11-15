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
import { FinanceKpiCards } from "@/components/finances/FinanceKpiCards"
import { MovementsTable } from "@/components/finances/MovementsTable"
import { MovementFormDialog } from "@/components/finances/MovementFormDialog"
import { getMovementCategoryMeta } from "@/components/finances/movement-constants"
import { movementsService } from "@/services/movements.service"
import { currenciesService } from "@/services/currencies.service"
import { movementCategoriesService } from "@/services/movement-categories.service"
import { customerOrdersService } from "@/services/customer-orders.service"
import { supplierOrdersService } from "@/services/supplier-orders.service"

export function MovementsSection({
  fixedMovementType = "",
  title = "Movimientos Financieros",
  description = "Historial de ingresos, abonos de clientes y egresos multimoneda.",
  newButtonLabel = "Registrar Movimiento",
}) {
  const [items, setItems] = React.useState([])
  const [allMovements, setAllMovements] = React.useState([])
  const [orders, setOrders] = React.useState([])
  const [supplierOrders, setSupplierOrders] = React.useState([])
  const [currencies, setCurrencies] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)

  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState(fixedMovementType)
  const [currencyFilter, setCurrencyFilter] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("")

  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const loadSummaryAndCatalogs = React.useCallback(async () => {
    const [movRes, ordRes, lotRes, currRes, catRes] = await Promise.allSettled([
      movementsService.getAll(),
      customerOrdersService.getAll({ include_products: "false" }),
      supplierOrdersService.getAll(),
      currenciesService.getAll(),
      movementCategoriesService.getAll(),
    ])

    if (movRes.status === "fulfilled" && Array.isArray(movRes.value.data)) {
      setAllMovements(movRes.value.data)
    }
    if (ordRes.status === "fulfilled" && Array.isArray(ordRes.value.data)) {
      setOrders(ordRes.value.data)
    }
    if (lotRes.status === "fulfilled" && Array.isArray(lotRes.value.data)) {
      setSupplierOrders(lotRes.value.data)
    }
    if (currRes.status === "fulfilled" && Array.isArray(currRes.value.data)) {
      setCurrencies(currRes.value.data)
    }
    if (catRes.status === "fulfilled" && Array.isArray(catRes.value.data)) {
      setCategories(catRes.value.data)
    }
  }, [])

  const fetchMovements = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await movementsService.getPaginated({
        page,
        per_page: 10,
        search,
        movement_type: fixedMovementType || typeFilter,
        currency_id: currencyFilter,
        category_id: categoryFilter,
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
    search,
    fixedMovementType,
    typeFilter,
    currencyFilter,
    categoryFilter,
  ])

  React.useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  React.useEffect(() => {
    loadSummaryAndCatalogs()
  }, [loadSummaryAndCatalogs])

  const handleSave = async (payload, newOrderPaymentStatus) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingItem?.id) {
        await movementsService.update(editingItem.id, payload)
      } else {
        await movementsService.create(payload)
        if (payload.source_id && newOrderPaymentStatus) {
          await customerOrdersService.update(payload.source_id, {
            payment_status: newOrderPaymentStatus,
          })
        }
      }
      setFormOpen(false)
      setEditingItem(null)
      fetchMovements()
      loadSummaryAndCatalogs()
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
      await movementsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchMovements()
      loadSummaryAndCatalogs()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const hasFilters = Boolean(
    search ||
      (!fixedMovementType && typeFilter) ||
      currencyFilter ||
      categoryFilter
  )

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Tarjetas KPI Superiores con Gráfico de Área Suavizada */}
      <FinanceKpiCards
        movements={allMovements}
        orders={orders}
        currencies={currencies}
      />

      {/* Tabla de Movimientos y Pagos */}
      <Card>
        <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
            {newButtonLabel}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col gap-2.5 border-y px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar en descripción..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
                }}
              />
            </div>

            {!fixedMovementType && (
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-44"
                value={typeFilter}
                onChange={(e) => {
                  setPage(1)
                  setTypeFilter(e.target.value)
                }}
              >
                <option value="">Todos (Ingresos y Egresos)</option>
                <option value="INCOME">Solo Ingresos (INCOME)</option>
                <option value="EXPENSE">Solo Egresos (EXPENSE)</option>
              </select>
            )}

            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-40"
              value={currencyFilter}
              onChange={(e) => {
                setPage(1)
                setCurrencyFilter(e.target.value)
              }}
            >
              <option value="">Todas las monedas</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <select
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-48"
              value={categoryFilter}
              onChange={(e) => {
                setPage(1)
                setCategoryFilter(e.target.value)
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => {
                const meta = getMovementCategoryMeta(cat.name)
                return (
                  <option key={cat.id} value={cat.id}>
                    {meta.label} ({cat.name})
                  </option>
                )
              })}
            </select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={() => {
                  setPage(1)
                  setSearch("")
                  if (!fixedMovementType) setTypeFilter("")
                  setCurrencyFilter("")
                  setCategoryFilter("")
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

          <MovementsTable
            movements={items}
            supplierOrders={supplierOrders}
            loading={loading}
            onEdit={(mov) => {
              setEditingItem(mov)
              setFormError(null)
              setFormOpen(true)
            }}
            onDelete={(mov) => {
              setDeleteError(null)
              setDeleteTarget(mov)
            }}
          />

          <PaginationBar meta={meta} onPageChange={setPage} />
        </CardContent>

        <MovementFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editingItem}
          defaultType={fixedMovementType || "INCOME"}
          currencies={currencies}
          categories={categories}
          orders={orders}
          supplierOrders={supplierOrders}
          saving={saving}
          error={formError}
          onSubmit={handleSave}
        />

        <ConfirmDeleteDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Eliminar Movimiento"
          description={`¿Estás seguro de eliminar este movimiento de ${deleteTarget?.amount} ${deleteTarget?.currency_code || ""}?`}
          error={deleteError}
          loading={deleting}
          onConfirm={handleConfirmDelete}
        />
      </Card>
    </div>
  )
}

