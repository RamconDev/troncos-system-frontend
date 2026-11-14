import * as React from "react"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"

const ToastContext = React.createContext(null)

// Emitter global para permitir llamar a toast(...) desde cualquier función
const toastListeners = new Set()

export const toast = {
  success: (message, options = {}) => emitToast({ type: "success", message, ...options }),
  error: (message, options = {}) => emitToast({ type: "error", message, ...options }),
  warning: (message, options = {}) => emitToast({ type: "warning", message, ...options }),
  info: (message, options = {}) => emitToast({ type: "info", message, ...options }),
}

function emitToast(toastData) {
  toastListeners.forEach((listener) => listener(toastData))
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const TOAST_STYLES = {
  success: "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-500/30",
  error: "border-destructive/40 bg-rose-50 text-rose-950 dark:bg-rose-950/90 dark:text-rose-100 dark:border-destructive/40",
  warning: "border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/90 dark:text-amber-100 dark:border-amber-500/30",
  info: "border-blue-500/30 bg-blue-50 text-blue-950 dark:bg-blue-950/90 dark:text-blue-100 dark:border-blue-500/30",
}

const ICON_STYLES = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-rose-600 dark:text-rose-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback((toastItem) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
    const newToast = {
      id,
      duration: toastItem.duration ?? 4500,
      ...toastItem,
    }

    setToasts((prev) => [...prev.slice(-4), newToast])

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [removeToast])

  React.useEffect(() => {
    toastListeners.add(addToast)
    return () => {
      toastListeners.delete(addToast)
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:max-w-md"
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type] || Info
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info
          const iconColor = ICON_STYLES[t.type] || ICON_STYLES.info

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg backdrop-blur-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${style}`}
            >
              <Icon className={`size-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-xs font-bold leading-tight mb-0.5">
                    {t.title}
                  </p>
                )}
                <p className="text-xs font-medium leading-relaxed break-words">
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity -mr-1 -mt-1"
                aria-label="Cerrar notificación"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    return { toast }
  }
  return context
}

