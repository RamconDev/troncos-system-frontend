import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaginationBar({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span className="text-center sm:text-left">
        Página <strong className="text-foreground">{meta.page}</strong> de{" "}
        <strong className="text-foreground">{meta.total_pages}</strong> ({meta.total} registros)
      </span>
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={!meta.has_prev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={!meta.has_next}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
