/**
 * Diccionario de mensajes amigables por código de error del backend
 */
export const ERROR_CODE_MESSAGES = {
  VALIDATION_ERROR: "Faltan campos obligatorios o hay valores inválidos.",
  NOT_FOUND: "El recurso solicitado no existe.",
  CUSTOMER_NOT_FOUND: "El cliente solicitado no existe.",
  CURRENCY_NOT_FOUND: "La moneda solicitada no existe.",
  DUPLICATE_CODE: "Ya existe un registro con ese código único.",
  DUPLICATE_NAME: "Ya existe un registro con ese nombre.",
  CONFLICT_HAS_MOVEMENTS:
    "No se puede eliminar porque tiene movimientos financieros asociados.",
  CONFLICT_HAS_ORDERS:
    "No se puede eliminar porque tiene órdenes asociadas.",
  DATABASE_ERROR: "Error interno al procesar en la base de datos.",
  NETWORK_ERROR:
    "No se pudo conectar con el servidor API (http://127.0.0.1:5000).",
}

/**
 * Error personalizado estandarizado para respuestas de la API de Troncos System
 */
export class ApiError extends Error {
  constructor({ code = "UNKNOWN_ERROR", message, details = null, status = 500 }) {
    const resolvedMessage =
      message || ERROR_CODE_MESSAGES[code] || "Ocurrió un error inesperado."
    super(resolvedMessage)
    this.name = "ApiError"
    this.code = code
    this.details = details
    this.status = status
    this.friendlyMessage = ERROR_CODE_MESSAGES[code] || resolvedMessage
  }
}

