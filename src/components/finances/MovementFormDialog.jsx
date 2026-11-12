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
import { formatUsd } from "@/components/orders/order-constants"

const INITIAL_FORM = {
  movement_type: "INCOME",
  amount: "",
  currency_id: "",
  applied_exchange_rate: "",
  category_id: "",
  source_id: "",
  description: "",
  update_order_payment_status: "",
}

export function MovementFormDialog({
  open,
  onOpenChange,
  initialData = null,
  defaultType = "INCOME",
  currencies = [],
  categories = [],
  orders = [],
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [form, setForm] = React.useState(INITIAL_FORM)

  React.useEffect(() => {
    if (!open) return

    if (initialData) {
      setForm({
        movement_type: initialData.movement_type || defaultType,
        amount: String(initialData.amount ?? ""),
        currency_id: String(initialData.currency_id ?? ""),
        applied_exchange_rate: String(initialData.applied_exchange_rate ?? ""),
        category_id: String(initialData.category_id ?? ""),
        source_id: initialData.source_id ? String(initialData.source_id) : "",
        description: initialData.description || "",
        update_order_payment_status: "",
      })
    } else {
      const activeCurr = currencies.find((c) => c.is_active) || currencies[0]
      const matchingCat =
        categories.find((cat) => cat.default_type === defaultType) ||
        categories[0]

      setForm({
        ...INITIAL_FORM,
        movement_type: matchingCat?.default_type || defaultType,
        currency_id: activeCurr ? String(activeCurr.id) : "",
        applied_exchange_rate: activeCurr ? String(activeCurr.usd_rate ?? 1) : "",
        category_id: matchingCat ? String(matchingCat.id) : "",
      })
    }
  }, [initialData, defaultType, currencies, categories, open])

  const handleCurrencyChange = (currencyId) => {
    const selected = currencies.find((c) => String(c.id) === String(currencyId))
    setForm((prev) => ({
      ...prev,
      currency_id: currencyId,
      applied_exchange_rate: selected
        ? String(selected.usd_rate ?? 1)
        : prev.applied_exchange_rate,
    }))
  }

  const handleCategoryChange = (categoryId) => {
    const selected = categories.find((cat) => String(cat.id) === String(categoryId))
    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
      movement_type: selected?.default_type || prev.movement_type,
    }))
  }

  const amountNum = Number(form.amount) || 0
  const rateNum = Number(form.applied_exchange_rate) || 1
  const estimatedUsd = rateNum > 0 ? amountNum / rateNum : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      amount: amountNum,
      currency_id: Number(form.currency_id),
      category_id: Number(form.category_id),
      movement_type: form.movement_type,
      source_id: form.source_id ? Number(form.source_id) : null,
      description: form.description.trim() || null,
    }

    if (form.applied_exchange_rate && Number(form.applied_exchange_rate) > 0) {
      payload.applied_exchange_rate = Number(form.applied_exchange_rate)
    }

    onSubmit(payload, form.update_order_payment_status || null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Movimiento Financiero" : "Registrar Movimiento"}
          </DialogTitle>
          <DialogDescription>
            Registra un ingreso o egreso en cualquier divisa; el equivalente en USD se calcula automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="mov-category">Categoría *</Label>
              <select
                id="mov-category"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Selecciona categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.default_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-type">Tipo de Movimiento *</Label>
              <select
                id="mov-type"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.movement_type}
                onChange={(e) =>
                  setForm({ ...form, movement_type: e.target.value })
                }
              >
                <option value="INCOME">INCOME (Ingreso)</option>
                <option value="EXPENSE">EXPENSE (Egreso)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="mov-currency">Moneda *</Label>
              <select
                id="mov-currency"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.currency_id}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="">Moneda...</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-amount">Monto *</Label>
              <Input
                id="mov-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="Ej. 81400"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-rate">Tasa Aplicada (1 USD)</Label>
              <Input
                id="mov-rate"
                type="number"
                step="any"
                min="0.0001"
                placeholder="Auto"
                value={form.applied_exchange_rate}
                onChange={(e) =>
                  setForm({ ...form, applied_exchange_rate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Equivalente calculado en dólares (amount_usd):
            </span>
            <strong className="font-mono text-sm text-foreground">
              {formatUsd(estimatedUsd)}
            </strong>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mov-source">
              Orden de Cliente Asociada (Opcional — source_id)
            </Label>
            <select
              id="mov-source"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
              value={form.source_id}
              onChange={(e) => setForm({ ...form, source_id: e.target.value })}
            >
              <option value="">Sin vincular a una orden específica</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  Orden #{ord.id} — {ord.customer_name || `Cliente #${ord.customer_id}`} (
                  Venta: {formatUsd(ord.total_sale_price_usd)} • {ord.payment_status})
                </option>
              ))}
            </select>
          </div>

          {!isEditing && form.source_id && form.movement_type === "INCOME" && (
            <div className="grid gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
              <Label htmlFor="mov-order-status" className="text-xs">
                ¿Actualizar también el estado de pago de la Orden #{form.source_id}?
              </Label>
              <select
                id="mov-order-status"
                className="border-input bg-background flex h-8 w-full rounded-md border px-2 text-xs shadow-xs outline-none"
                value={form.update_order_payment_status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    update_order_payment_status: e.target.value,
                  })
                }
              >
                <option value="">No cambiar estado de la orden</option>
                <option value="PARTIAL">Marcar orden como Abono Parcial (PARTIAL)</option>
                <option value="PAID">Marcar orden como Pagada (PAID)</option>
              </select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="mov-desc">Descripción / Concepto</Label>
            <Input
              id="mov-desc"
              placeholder="Ej. Abono transferencia Bancolombia / Pago lote proveedor"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
                  : "Registrar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

