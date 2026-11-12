import * as React from "react"
import { Wand2 } from "lucide-react"
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
import {
  SUPPLIER_ORDER_STATUS_OPTIONS,
  build17TrackUrl,
} from "@/components/supplier-orders/supplier-order-constants"
import { formatUsd } from "@/components/orders/order-constants"
import { customerOrdersService } from "@/services/customer-orders.service"
import { supplierOrdersService } from "@/services/supplier-orders.service"

const INITIAL_FORM = {
  code: "",
  status: "OPEN",
  tracking_code: "",
  tracking_url: "",
  notes: "",
}

export function SupplierOrderFormDialog({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [form, setForm] = React.useState(INITIAL_FORM)
  const [availableOrders, setAvailableOrders] = React.useState([])
  const [selectedOrderIds, setSelectedOrderIds] = React.useState([])
  const [loadingOrders, setLoadingOrders] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    if (initialData) {
      setForm({
        code: initialData.code || "",
        status: initialData.status || "OPEN",
        tracking_code: initialData.tracking_code || "",
        tracking_url: initialData.tracking_url || "",
        notes: initialData.notes || "",
      })
    } else {
      setForm(INITIAL_FORM)
      setSelectedOrderIds([])
    }

    let active = true
    setLoadingOrders(true)

    const fetchCandidateOrders = async () => {
      try {
        const unassignedRes = await customerOrdersService.getAll({
          unassigned_only: "true",
        })
        const unassignedList = Array.isArray(unassignedRes.data)
          ? unassignedRes.data
          : []

        if (initialData?.id) {
          const detailRes = await supplierOrdersService.getById(initialData.id)
          const assignedList = Array.isArray(detailRes.data?.customer_orders)
            ? detailRes.data.customer_orders
            : []

          if (!active) return
          setSelectedOrderIds(assignedList.map((o) => o.id))

          // Combinar órdenes ya asignadas a este lote + las que no tienen lote
          const mergedMap = new Map()
          assignedList.forEach((o) => mergedMap.set(o.id, o))
          unassignedList.forEach((o) => mergedMap.set(o.id, o))
          setAvailableOrders(Array.from(mergedMap.values()))
        } else {
          if (!active) return
          setAvailableOrders(unassignedList)
        }
      } catch {
        // Silencioso
      } finally {
        if (active) setLoadingOrders(false)
      }
    }

    fetchCandidateOrders()
    return () => {
      active = false
    }
  }, [initialData, open])

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleAutoTrackingUrl = () => {
    if (!form.tracking_code.trim()) return
    setForm((prev) => ({
      ...prev,
      tracking_url: build17TrackUrl(prev.tracking_code),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      code: form.code.trim(),
      status: form.status,
      tracking_code: form.tracking_code.trim() || null,
      tracking_url: form.tracking_url.trim() || null,
      notes: form.notes.trim() || null,
      customer_order_ids: selectedOrderIds,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Editar Lote ${initialData.code}`
              : "Nuevo Lote / Orden a Proveedor"}
          </DialogTitle>
          <DialogDescription>
            Registra el código del lote, su estado de envío, guía de rastreo y vincula órdenes de clientes.
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
              <Label htmlFor="lot-code">Código del Lote *</Label>
              <Input
                id="lot-code"
                placeholder="Ej. NOV2026-01 o 19102026"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lot-status">Estado del Lote</Label>
              <select
                id="lot-status"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {SUPPLIER_ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lot-tracking">Código de Rastreo (Tracking Code)</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="lot-tracking"
                placeholder="Ej. 4PX3003321087955CN"
                className="flex-1 font-mono"
                value={form.tracking_code}
                onChange={(e) =>
                  setForm({ ...form, tracking_code: e.target.value })
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                disabled={!form.tracking_code.trim()}
                onClick={handleAutoTrackingUrl}
              >
                <Wand2 className="size-3.5" />
                Generar URL 17track
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lot-url">URL de Rastreo (Tracking URL)</Label>
            <Input
              id="lot-url"
              type="url"
              placeholder="https://m.17track.net/es/track-details?nums=..."
              value={form.tracking_url}
              onChange={(e) =>
                setForm({ ...form, tracking_url: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lot-notes">Notas del Lote</Label>
            <Input
              id="lot-notes"
              placeholder="Ej. Primer lote de noviembre"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Asignación de Órdenes de Clientes */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>
                Órdenes de Clientes Vinculadas ({selectedOrderIds.length})
              </Label>
              {availableOrders.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    if (selectedOrderIds.length === availableOrders.length) {
                      setSelectedOrderIds([])
                    } else {
                      setSelectedOrderIds(availableOrders.map((o) => o.id))
                    }
                  }}
                >
                  {selectedOrderIds.length === availableOrders.length
                    ? "Deseleccionar todas"
                    : "Seleccionar todas"}
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/20 divide-y">
              {loadingOrders ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Cargando órdenes disponibles...
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No hay órdenes de clientes pendientes de lote en este momento.
                </div>
              ) : (
                availableOrders.map((ord) => {
                  const checked = selectedOrderIds.includes(ord.id)
                  const count = ord.products?.length ?? 0
                  return (
                    <label
                      key={ord.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary rounded shrink-0"
                          checked={checked}
                          onChange={() => toggleOrderSelection(ord.id)}
                        />
                        <div className="truncate">
                          <span className="font-mono font-semibold">
                            #{ord.id}
                          </span>{" "}
                          —{" "}
                          <span className="font-medium">
                            {ord.customer_name || `Cliente #${ord.customer_id}`}
                          </span>
                          <span className="text-muted-foreground ml-1.5">
                            ({count} prenda{count === 1 ? "" : "s"})
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-medium shrink-0">
                        Costo: {formatUsd(ord.total_base_cost_usd)}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
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
                  : "Crear Lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

