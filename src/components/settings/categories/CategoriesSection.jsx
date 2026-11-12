import * as React from "react"
import { Plus, Search } from "lucide-react"
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
import { CategoriesTable } from "@/components/settings/categories/CategoriesTable"
import { CategoryFormDialog } from "@/components/settings/categories/CategoryFormDialog"
import { movementCategoriesService } from "@/services/movement-categories.service"

export function CategoriesSection() {
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const fetchCategories = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await movementCategoriesService.getPaginated({
        page,
        per_page: 10,
        search,
        default_type: typeFilter,
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingItem?.id) {
        await movementCategoriesService.update(editingItem.id, payload)
      } else {
        await movementCategoriesService.create(payload)
      }
      setFormOpen(false)
      setEditingItem(null)
      fetchCategories()
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
      await movementCategoriesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Categorías de Movimientos</CardTitle>
          <CardDescription>
            Clasificación de ingresos (INCOME) y egresos (EXPENSE) financieros.
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null)
            setFormError(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nueva Categoría
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-y px-6 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categoría..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>

          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none"
            value={typeFilter}
            onChange={(e) => {
              setPage(1)
              setTypeFilter(e.target.value)
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="INCOME">Solo Ingresos (INCOME)</option>
            <option value="EXPENSE">Solo Egresos (EXPENSE)</option>
          </select>
        </div>

        {listError && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {listError}
          </div>
        )}

        <CategoriesTable
          categories={items}
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

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        saving={saving}
        error={formError}
        onSubmit={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar Categoría"
        description={`¿Estás seguro de eliminar la categoría "${deleteTarget?.name}"?`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

