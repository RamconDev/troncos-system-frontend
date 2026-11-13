import * as React from "react"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Dropdown selector con checkboxes para mostrar u ocultar columnas de una tabla.
 * Permite marcar/desmarcar sin cerrar el menú y tiene botón para restaurar todas.
 */
export function ColumnVisibilityDropdown({
  columns = [], // Array de { id: string, label: string }
  visibleColumns = {}, // Record<string, boolean>
  onToggleColumn,
  onResetColumns,
  className = "",
}) {
  const visibleCount = columns.filter((col) => visibleColumns[col.id] !== false).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-1.5 text-xs font-medium ${className}`}
        >
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span>Columnas</span>
          <span className="ml-0.5 rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
            {visibleCount}/{columns.length}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-xs font-semibold">
            Mostrar Columnas
          </DropdownMenuLabel>
          {onResetColumns && (
            <button
              type="button"
              onClick={onResetColumns}
              title="Mostrar todas las columnas"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-y-auto">
          {columns.map((col) => {
            const isChecked = visibleColumns[col.id] !== false

            return (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={isChecked}
                onSelect={(e) => {
                  e.preventDefault() // Evita que se cierre el dropdown al hacer clic
                  onToggleColumn?.(col.id)
                }}
                className="text-xs cursor-pointer"
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

