import { Pencil, Trash2, Power } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CurrenciesTable({
  currencies,
  loading,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando monedas...
      </div>
    )
  }

  if (!currencies.length) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No se encontraron monedas registradas.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Símbolo</TableHead>
          <TableHead>Tasa (1 USD)</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currencies.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-mono font-semibold">
              {item.code}
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {item.symbol}
            </TableCell>
            <TableCell className="font-medium">
              {Number(item.usd_rate).toLocaleString("es-CO", {
                maximumFractionDigits: 4,
              })}{" "}
              <span className="text-xs text-muted-foreground">{item.code}</span>
            </TableCell>
            <TableCell>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Activa" : "Inactiva"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title={item.is_active ? "Desactivar" : "Activar"}
                  onClick={() => onToggleActive(item)}
                >
                  <Power className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar moneda / tasa"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  title="Eliminar moneda"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

