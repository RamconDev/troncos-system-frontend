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
  code: "",
  symbol: "",
  usd_rate: "1",
  is_active: true,
}

export function CurrencyFormDialog({
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
        code: initialData.code || "",
        symbol: initialData.symbol || "",
        usd_rate: String(initialData.usd_rate ?? 1),
        is_active: initialData.is_active ?? true,
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [initialData, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      symbol: form.symbol.trim(),
      usd_rate: Number(form.usd_rate) || 1,
      is_active: Boolean(form.is_active),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Moneda" : "Nueva Moneda"}
          </DialogTitle>
          <DialogDescription>
            Define el código, símbolo y cuántas unidades equivalen a 1 USD.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="currency-name">Nombre</Label>
            <Input
              id="currency-name"
              placeholder="Ej. Colombian Peso"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="currency-code">Código ISO</Label>
              <Input
                id="currency-code"
                placeholder="Ej. COP"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency-symbol">Símbolo</Label>
              <Input
                id="currency-symbol"
                placeholder="Ej. COP$"
                required
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency-rate">Tasa por 1 USD (usd_rate)</Label>
            <Input
              id="currency-rate"
              type="number"
              step="any"
              min="0.0001"
              required
              value={form.usd_rate}
              onChange={(e) => setForm({ ...form, usd_rate: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="size-4 accent-primary rounded"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>Moneda activa para transacciones</span>
          </label>

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
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Moneda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

