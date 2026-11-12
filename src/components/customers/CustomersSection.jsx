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
import { CustomersTable } from "@/components/customers/CustomersTable"
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog"
import { customersService } from "@/services/customers.service"

export function CustomersSection() {
  const [items, setItems] = React.useState([])
  const [allReferences, setAllReferences] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [referenceFilter, setReferenceFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const loadReferences = React.useCallback(async () => {
    try {
      const res = await customersService.getAll()
      const list = Array.isArray(res.data) ? res.data : []
      const uniqueRefs = Array.from(
        new Set(list.map((c) => c.reference).filter(Boolean))
      ).sort()
      setAllReferences(uniqueRefs)
    } catch {
      // Silencioso: el listado principal mostrará cualquier error de red
    }
  }, [])

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await customersService.getPaginated({
        page,
        per_page: 10,
        search,
        reference: referenceFilter,
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, referenceFilter])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  React.useEffect(() => {
    loadReferences()
  }, [loadReferences])

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingItem?.id) {
        await customersService.update(editingItem.id, payload)
      } else {
        await customersService.create(payload)
      }
      setFormOpen(false)
      setEditingItem(null)
      fetchCustomers()
      loadReferences()
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
      await customersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchCustomers()
      loadReferences()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const hasActiveFilters = Boolean(search || referenceFilter)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle>Clientes Registrados</CardTitle>
          <CardDescription>
            Filtra por nombre, teléfono o grupo de referencia y accede directo a su WhatsApp o historial de pedidos.
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
          Nuevo Cliente
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Barra de Búsqueda y Filtro por Referencia Responsiva */}
        <div className="flex flex-col gap-2.5 border-y px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, teléfono o ref..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <select
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none sm:w-52"
            value={referenceFilter}
            onChange={(e) => {
              setPage(1)
              setReferenceFilter(e.target.value)
            }}
          >
            <option value="">Todas las referencias</option>
            {allReferences.map((ref) => (
              <option key={ref} value={ref}>
                Grupo: {ref}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs"
              onClick={() => {
                setPage(1)
                setSearch("")
                setReferenceFilter("")
              }}
            >
              <X className="size-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {listError && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {listError}
          </div>
        )}

        <CustomersTable
          customers={items}
          loading={loading}
          onEdit={(customer) => {
            setEditingItem(customer)
            setFormError(null)
            setFormOpen(true)
          }}
          onDelete={(customer) => {
            setDeleteError(null)
            setDeleteTarget(customer)
          }}
        />

        <PaginationBar meta={meta} onPageChange={setPage} />
      </CardContent>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        referenceOptions={allReferences}
        saving={saving}
        error={formError}
        onSubmit={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar Cliente"
        description={`¿Estás seguro de eliminar a "${deleteTarget?.name}"? Si tiene pedidos asociados no podrá eliminarse.`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

