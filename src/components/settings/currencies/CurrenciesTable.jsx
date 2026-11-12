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
    <>
      {/* Vista Móvil: Tarjetas compactas (< md) */}
      <div className="divide-y md:hidden">
        {currencies.map((item) => (
          <div key={item.id} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{item.code}</span>
                  <span className="text-xs text-muted-foreground">({item.symbol})</span>
                </div>
                <p className="text-sm text-foreground">{item.name}</p>
              </div>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-muted-foreground">
                1 USD ={" "}
                <strong className="text-sm text-foreground">
                  {Number(item.usd_rate).toLocaleString("es-CO", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  {item.code}
                </strong>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title={item.is_active ? "Desactivar" : "Activar"}
                  onClick={() => onToggleActive(item)}
                >
                  <Power className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title="Editar moneda / tasa"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  title="Eliminar moneda"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
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
      </div>
    </>
  )
}
