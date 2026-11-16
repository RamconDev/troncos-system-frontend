import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const INITIAL_FORM = {
  name: "",
  default_type: "INCOME",
  description: "",
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [form, setForm] = React.useState(INITIAL_FORM)

  React.useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        default_type: initialData.default_type || "INCOME",
        description: initialData.description || "",
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [initialData, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      default_type: form.default_type,
      description: form.description.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoría" : "Nueva Categoría de Movimiento"}
          </DialogTitle>
          <DialogDescription>
            Define el nombre del concepto y su tipo predeterminado (Ingreso o Egreso).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="cat-name">Nombre / Código</Label>
            <Input
              id="cat-name"
              placeholder="Ej. ORDER_PAYMENT o SUPPLIER_PAYMENT"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-type">Tipo por Defecto</Label>
            <select
              id="cat-type"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={form.default_type}
              onChange={(e) => setForm({ ...form, default_type: e.target.value })}
            >
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Egreso</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-desc">Descripción</Label>
            <Input
              id="cat-desc"
              placeholder="Ej. Pagos recibidos de órdenes de clientes"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

