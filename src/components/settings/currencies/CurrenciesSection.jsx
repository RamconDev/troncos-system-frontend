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
import { CurrenciesTable } from "@/components/settings/currencies/CurrenciesTable"
import { CurrencyFormDialog } from "@/components/settings/currencies/CurrencyFormDialog"
import { currenciesService } from "@/services/currencies.service"

export function CurrenciesSection() {
  const [items, setItems] = React.useState([])
  const [meta, setMeta] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [listError, setListError] = React.useState(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [formError, setFormError] = React.useState(null)

  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState(null)

  const fetchCurrencies = React.useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await currenciesService.getPaginated({
        page,
        per_page: 10,
        search,
      })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta(res.meta)
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  React.useEffect(() => {
    fetchCurrencies()
  }, [fetchCurrencies])

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingItem?.id) {
        await currenciesService.update(editingItem.id, payload)
      } else {
        await currenciesService.create(payload)
      }
      setFormOpen(false)
      setEditingItem(null)
      fetchCurrencies()
    } catch (err) {
      setFormError(err.friendlyMessage || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item) => {
    try {
      await currenciesService.update(item.id, { is_active: !item.is_active })
      fetchCurrencies()
    } catch (err) {
      setListError(err.friendlyMessage || err.message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await currenciesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchCurrencies()
    } catch (err) {
      setDeleteError(err.friendlyMessage || err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle>Monedas y Tasas de Cambio</CardTitle>
          <CardDescription>
            Gestiona las divisas aceptadas y su equivalencia frente a 1 USD.
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
          Nueva Moneda
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center gap-3 border-y px-4 py-3 sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, código o símbolo..."
              className="pl-8 h-9"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>
        </div>

        {listError && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {listError}
          </div>
        )}

        <CurrenciesTable
          currencies={items}
          loading={loading}
          onEdit={(item) => {
            setEditingItem(item)
            setFormError(null)
            setFormOpen(true)
          }}
          onToggleActive={handleToggleActive}
          onDelete={(item) => {
            setDeleteError(null)
            setDeleteTarget(item)
          }}
        />

        <PaginationBar meta={meta} onPageChange={setPage} />
      </CardContent>

      <CurrencyFormDialog
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
        title="Eliminar Moneda"
        description={`¿Estás seguro de eliminar la moneda "${deleteTarget?.name} (${deleteTarget?.code})"?`}
        error={deleteError}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}
