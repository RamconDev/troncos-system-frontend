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
import { COMMON_SIZES, formatUsd } from "@/components/orders/order-constants"

const INITIAL_FORM = {
  customer_order_id: "",
  name: "",
  size: "M",
  base_cost: "",
  sale_price: "",
  reference_url: "",
  notes: "",
}

export function ProductFormDialog({
  open,
  onOpenChange,
  initialData = null,
  fixedOrderId = null,
  ordersList = [],
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [form, setForm] = React.useState(INITIAL_FORM)

  React.useEffect(() => {
    if (initialData) {
      setForm({
        customer_order_id: String(
          initialData.customer_order_id ?? fixedOrderId ?? ""
        ),
        name: initialData.name || "",
        size: initialData.size ?? "",
        base_cost: String(initialData.base_cost ?? ""),
        sale_price: String(initialData.sale_price ?? ""),
        reference_url: initialData.reference_url || "",
        notes: initialData.notes || "",
      })
    } else {
      setForm({
        ...INITIAL_FORM,
        customer_order_id: fixedOrderId ? String(fixedOrderId) : "",
      })
    }
  }, [initialData, fixedOrderId, open])

  const baseCostNum = Number(form.base_cost) || 0
  const salePriceNum = Number(form.sale_price) || 0
  const profitNum = salePriceNum - baseCostNum

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      customer_order_id: Number(form.customer_order_id),
      name: form.name.trim(),
      size: form.size.trim() || null,
      base_cost: baseCostNum,
      sale_price: salePriceNum,
      reference_url: form.reference_url.trim() || null,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Agregar Producto a Orden"}
          </DialogTitle>
          <DialogDescription>
            Registra la prenda, talla, costos en USD, link de Yupoo y detalles de estampado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {!fixedOrderId && (
            <div className="grid gap-2">
              <Label htmlFor="prod-order">Orden de Cliente *</Label>
              {ordersList.length > 0 ? (
                <select
                  id="prod-order"
                  required
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                  value={form.customer_order_id}
                  onChange={(e) =>
                    setForm({ ...form, customer_order_id: e.target.value })
                  }
                >
                  <option value="">Selecciona una orden...</option>
                  {ordersList.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      Orden #{ord.id} — {ord.customer_name || `Cliente #${ord.customer_id}`}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="prod-order"
                  type="number"
                  min="1"
                  required
                  placeholder="ID de la orden (ej. 10)"
                  value={form.customer_order_id}
                  onChange={(e) =>
                    setForm({ ...form, customer_order_id: e.target.value })
                  }
                />
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="prod-name">Nombre de la Prenda / Producto *</Label>
            <Input
              id="prod-name"
              placeholder="Ej. Retro 98-99 Fiorentina Home S-XXL"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="prod-size">Talla (opcional)</Label>
              <Input
                id="prod-size"
                list="common-sizes-list"
                placeholder="M, L, XL o vacío"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />
              <datalist id="common-sizes-list">
                {COMMON_SIZES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-cost">Costo Base (USD)</Label>
              <Input
                id="prod-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="19.00"
                required
                value={form.base_cost}
                onChange={(e) => setForm({ ...form, base_cost: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-sale">Precio Venta (USD)</Label>
              <Input
                id="prod-sale"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.00"
                required
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Ganancia estimada en prenda:</span>
            <strong
              className={
                profitNum >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }
            >
              {formatUsd(profitNum)}
            </strong>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prod-url">URL de Referencia (Yupoo / Álbum)</Label>
            <Input
              id="prod-url"
              type="url"
              placeholder="https://qiuyipifa686868.x.yupoo.com/albums/..."
              value={form.reference_url}
              onChange={(e) =>
                setForm({ ...form, reference_url: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prod-notes">Notas (Versión, Estampado, Parches)</Label>
            <Input
              id="prod-notes"
              placeholder="Ej. Version: Retro | Estampado: Batistuta, 9"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Agregar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

