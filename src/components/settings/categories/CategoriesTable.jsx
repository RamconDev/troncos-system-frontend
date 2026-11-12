import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react"
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

export function CategoriesTable({
  categories,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando categorías...
      </div>
    )
  }

  if (!categories.length) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No se encontraron categorías de movimiento.
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas compactas (< md) */}
      <div className="divide-y md:hidden">
        {categories.map((item) => {
          const isIncome = item.default_type === "INCOME"
          return (
            <div key={item.id} className="flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-sm font-bold break-all">
                  {item.name}
                </span>
                <Badge
                  variant={isIncome ? "default" : "secondary"}
                  className={
                    isIncome
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  }
                >
                  {isIncome ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {isIncome ? "Ingreso" : "Egreso"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                {item.description || "Sin descripción"}
              </p>

              <div className="flex items-center justify-end gap-1 pt-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title="Editar categoría"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  title="Eliminar categoría"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo por Defecto</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((item) => {
              const isIncome = item.default_type === "INCOME"
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-semibold">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isIncome ? "default" : "secondary"}
                      className={
                        isIncome
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                      }
                    >
                      {isIncome ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {isIncome ? "Ingreso (INCOME)" : "Egreso (EXPENSE)"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {item.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar categoría"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar categoría"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
