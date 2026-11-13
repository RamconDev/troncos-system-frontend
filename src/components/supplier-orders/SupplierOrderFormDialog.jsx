import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
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
  parseTrackingCodes,
  serializeTrackingCodes,
} from "@/components/supplier-orders/supplier-order-constants"
import { formatUsd } from "@/components/orders/order-constants"
import { customerOrdersService } from "@/services/customer-orders.service"
import { supplierOrdersService } from "@/services/supplier-orders.service"

export function SupplierOrderFormDialog({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState("OPEN")
  const [trackingCodes, setTrackingCodes] = React.useState([""])
  const [notes, setNotes] = React.useState("")

  const [availableOrders, setAvailableOrders] = React.useState([])
  const [selectedOrderIds, setSelectedOrderIds] = React.useState([])
  const [loadingOrders, setLoadingOrders] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    if (initialData) {
      const parsedCodes = parseTrackingCodes(initialData.tracking_code)
      setCode(initialData.code || "")
      setStatus(initialData.status || "OPEN")
      setTrackingCodes(parsedCodes.length > 0 ? parsedCodes : [""])
      setNotes(initialData.notes || "")
    } else {
      setCode("")
      setStatus("OPEN")
      setTrackingCodes([""])
      setNotes("")
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

  const handleTrackingCodeChange = (index, value) => {
    setTrackingCodes((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    )
  }

  const handleAddTrackingCode = () => {
    setTrackingCodes((prev) => [...prev, ""])
  }

  const handleRemoveTrackingCode = (index) => {
    setTrackingCodes((prev) => {
      const next = prev.filter((_, idx) => idx !== index)
      return next.length > 0 ? next : [""]
    })
  }

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const serializedCodes = serializeTrackingCodes(trackingCodes)
    const generatedUrl = build17TrackUrl(trackingCodes)

    onSubmit({
      code: code.trim(),
      status: isEditing ? status : "OPEN",
      tracking_code: serializedCodes,
      tracking_url: generatedUrl,
      notes: notes.trim() || null,
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
            {isEditing
              ? "Actualiza el código, estado, guías de rastreo u órdenes vinculadas."
              : "El nuevo lote se creará automáticamente en estado Abierto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div
            className={`grid grid-cols-1 gap-3 ${
              isEditing ? "sm:grid-cols-2" : ""
            }`}
          >
            <div className="grid gap-2">
              <Label htmlFor="lot-code">Código del Lote *</Label>
              <Input
                id="lot-code"
                placeholder="Ej. NOV2026-01 o 19102026"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="lot-status">Estado del Lote</Label>
                <select
                  id="lot-status"
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {SUPPLIER_ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Lista Dinámica de Códigos de Rastreo */}
          <div className="grid gap-2 rounded-lg border bg-muted/15 p-3">
            <Label className="text-xs font-semibold">
              Códigos de Rastreo (Opcional)
            </Label>

            <div className="flex flex-col gap-2">
              {trackingCodes.map((trackValue, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={`Código de rastreo #${idx + 1} (ej. 4PX3003321087955CN)`}
                    className="font-mono text-xs h-9"
                    value={trackValue}
                    onChange={(e) =>
                      handleTrackingCodeChange(idx, e.target.value)
                    }
                  />
                  {(trackingCodes.length > 1 || trackValue.trim() !== "") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:text-destructive"
                      title="Quitar este código"
                      onClick={() => handleRemoveTrackingCode(idx)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs h-8"
                onClick={handleAddTrackingCode}
              >
                <Plus className="size-3.5" />
                Agregar otro código de rastreo
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lot-notes">Notas del Lote</Label>
            <Input
              id="lot-notes"
              placeholder="Ej. Primer lote de noviembre"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Asignación de Órdenes de Clientes */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>
                Órdenes de Clientes sin Lote Asignado ({selectedOrderIds.length} seleccionadas)
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
