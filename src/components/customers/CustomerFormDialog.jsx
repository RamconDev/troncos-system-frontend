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
  phone: "",
  reference: "",
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  initialData = null,
  referenceOptions = [],
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
        phone: initialData.phone || "",
        reference: initialData.reference || "",
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [initialData, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      reference: form.reference.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Registra los datos de contacto y grupo/referencia del cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="customer-name">Nombre Completo *</Label>
            <Input
              id="customer-name"
              placeholder="Ej. Angel Chacon"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customer-phone">Teléfono / WhatsApp</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="Ej. 5804147440064"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <span className="text-[11px] text-muted-foreground">
              Incluye el código de país sin signos para enlace directo a WhatsApp.
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customer-reference">Referencia / Grupo</Label>
            <Input
              id="customer-reference"
              list="customer-references-list"
              placeholder="Ej. Mario, Viniles, Creisi, Licorería..."
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            {referenceOptions.length > 0 && (
              <datalist id="customer-references-list">
                {referenceOptions.map((ref) => (
                  <option key={ref} value={ref} />
                ))}
              </datalist>
            )}
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
                  : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

