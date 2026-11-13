# Especificación Técnica: Sistema de Rastreo de Paquetes y Estados de Lotes (`TRAKING.md`)

Este documento define la arquitectura de base de datos, reglas de negocio, máquina de estados y endpoints REST para implementar el rastreo multi-guía en el backend (**Flask + SQLAlchemy**) de `troncos-system`.

---

## 1. ¿Por qué usar una tabla específica con bandera `is_delivered`?

**Sí, es totalmente recomendable crear una tabla dedicada (`supplier_order_trackings`) con el campo booleano `is_delivered`.**

### Razones técnicas y de costos:
1. **Ahorro de cuota en APIs externas (17TRACK / TrackingMore / AfterShip)**:
   - Las APIs de rastreo cobran por guía registrada o tienen límites estrictos de peticiones por minuto/mes.
   - Si una guía ya llegó a su destino en Colombia (`is_delivered = True`), **su estado es final e inmutable**. El backend filtra `WHERE is_delivered = False` antes de consultar la API externa, evitando gastar créditos o hacer peticiones innecesarias por paquetes que ya llegaron hace días.
2. **Múltiples paquetes por lote (Relación `1:N`)**:
   - Un mismo lote (`SupplierOrder`) suele dividirse en varios paquetes enviados en distintos días por el proveedor. Cada código de rastreo tiene su propio transportista, fecha de envío, último evento y fecha de entrega.
3. **Automatización del estado del Lote (`DELIVERED` vs `RECEIVED`)**:
   - Permite evaluar con una simple consulta si **todos** los paquetes del lote ya tienen `is_delivered == True` para pasar el lote automáticamente a `DELIVERED` (Entregado en Colombia / Listo para retirar).

---

## 2. Máquina de Estados del Lote (`SupplierOrder.status`)

Dado que los paquetes llegan primero a **Colombia** (casillero / dirección receptora) y posteriormente tú debes ir a buscarlos para tenerlos físicamente en tus manos, el flujo de estados del lote queda definido en **5 etapas**:

| Código (`status`) | Etiqueta en UI | ¿Quién lo activa? | Descripción del Estado |
| :--- | :--- | :--- | :--- |
| **`OPEN`** | `Abierto (Armando)` | **Automático al crear** | Estado inicial por defecto cuando se crea el lote y se le están asignando pedidos de clientes. |
| **`ORDERED`** | `Pedido a Proveedor` | Manual / Automático | Ya se pagó/ordenó al proveedor, esperando guías o despacho. |
| **`IN_TRANSIT`** | `En Tránsito` | **Automático** (al agregar guías o detectar movimiento) | Al menos uno de los paquetes está viajando hacia Colombia. |
| **`DELIVERED`** | `Entregado (Colombia)` | **Automático** (al estar todas las guías `is_delivered = True`) | **Todos** los códigos de rastreo del lote fueron entregados en la dirección de Colombia. Listos para que vayas a retirarlos. |
| **`RECEIVED`** | `Recibido (En mis manos)` | **Manual por el usuario** | Ya buscaste los paquetes en Colombia, verificaste las prendas y los tienes físicamente en tu posesión. |

### Regla de Oro de Transición Automática:
- Cuando el backend actualiza el estado de una o varias guías de un lote:
  - Si el lote tiene al menos 1 guía (`len(lot.trackings) > 0`) y **todas** tienen `is_delivered == True`:
    - Si `lot.status` está en `("OPEN", "ORDERED", "IN_TRANSIT")`, el backend cambia automáticamente `lot.status = "DELIVERED"`.
    - **Nunca** sobrescribe `lot.status` si ya estaba en `"RECEIVED"` (para no retroceder un lote que ya retiraste).
  - Si al menos 1 guía pasa a `"IN_TRANSIT"` y el lote estaba en `"OPEN"` u `"ORDERED"`, el backend puede actualizar automáticamente `lot.status = "IN_TRANSIT"`.

---

## 3. Modelo de Base de Datos (`SQLAlchemy`)

### 3.1. Nueva Tabla: `supplier_order_trackings`

```python
from datetime import datetime, timezone
from app.extensions import db

class SupplierOrderTracking(db.Model):
    __tablename__ = "supplier_order_trackings"

    id = db.Column(db.Integer, primary_key=True)
    supplier_order_id = db.Column(
        db.Integer,
        db.ForeignKey("supplier_orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tracking_code = db.Column(db.String(100), nullable=False, index=True)
    carrier_code = db.Column(db.String(50), nullable=True)       # Ej: "4px", "cainiao", "usps", "dhl"
    carrier_name = db.Column(db.String(100), nullable=True)      # Ej: "4PX Express", "Cainiao"

    # Estado estandarizado del paquete individual:
    # Valores permitidos: "NOT_FOUND", "INFO_RECEIVED", "IN_TRANSIT", "EXCEPTION", "DELIVERED"
    status = db.Column(db.String(30), nullable=False, default="NOT_FOUND")

    # Bandera crítica para NO volver a consultar la API externa una vez entregado en Colombia
    is_delivered = db.Column(db.Boolean, nullable=False, default=False, index=True)

    # Información opcional del último evento reportado por la API
    last_event_description = db.Column(db.String(255), nullable=True)
    last_event_location = db.Column(db.String(120), nullable=True)
    last_event_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # Control de auditoría y rate-limiting
    last_checked_at = db.Column(db.DateTime(timezone=True), nullable=True)
    delivered_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "supplier_order_id",
            "tracking_code",
            name="uq_supplier_order_tracking_code",
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "supplier_order_id": self.supplier_order_id,
            "tracking_code": self.tracking_code,
            "carrier_code": self.carrier_code,
            "carrier_name": self.carrier_name,
            "status": "DELIVERED" if self.is_delivered else self.status,
            "is_delivered": self.is_delivered,
            "last_event_description": self.last_event_description,
            "last_event_location": self.last_event_location,
            "last_event_at": self.last_event_at.isoformat() if self.last_event_at else None,
            "last_checked_at": self.last_checked_at.isoformat() if self.last_checked_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
```

---

### 3.2. Relación y Retrocompatibilidad en `SupplierOrder`

Para mantener compatibilidad total con lo que ya hace el frontend (`tracking_code` separado por comas) y a la vez exponer el arreglo enriquecido `trackings`:

```python
class SupplierOrder(db.Model):
    __tablename__ = "supplier_orders"
    # ... campos existentes (id, code, status, tracking_code, tracking_url, notes, created_at) ...

    trackings = db.relationship(
        "SupplierOrderTracking",
        backref="supplier_order",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="SupplierOrderTracking.id.asc()",
    )

    def recalculate_lot_status_from_trackings(self):
        """
        Evalúa todas las guías del lote y actualiza automáticamente el estado del lote:
        - Si TODAS las guías tienen is_delivered=True -> pasa a 'DELIVERED' (salvo que ya sea 'RECEIVED').
        - Si alguna guía está en tránsito y el lote estaba 'OPEN' u 'ORDERED' -> pasa a 'IN_TRANSIT'.
        """
        if not self.trackings:
            return

        # Nunca retroceder un lote que el usuario ya marcó manualmente como RECEIVED en sus manos
        if self.status == "RECEIVED":
            return

        all_delivered = all(t.is_delivered for t in self.trackings)
        if all_delivered:
            self.status = "DELIVERED"
            return

        any_moving = any(
            t.status in ("IN_TRANSIT", "INFO_RECEIVED") or t.is_delivered
            for t in self.trackings
        )
        if any_moving and self.status in ("OPEN", "ORDERED"):
            self.status = "IN_TRANSIT"
```

---

## 4. Sincronización al Crear o Editar un Lote (`POST` / `PUT`)

Cuando el frontend envía `tracking_code: "LP00123, YT998877"` (o un arreglo `tracking_codes: ["LP00123", "YT998877"]`) al crear o editar un lote:

```python
def sync_tracking_codes_on_save(supplier_order, raw_tracking_code_str):
    """
    Sincroniza los códigos enviados desde el formulario con la tabla supplier_order_trackings,
    preservando intactos los registros existentes (y su is_delivered) para no perder historial.
    """
    if raw_tracking_code_str is None:
        return

    incoming_codes = [
        c.strip()
        for c in raw_tracking_code_str.replace(";", ",").replace("\n", ",").split(",")
        if c.strip()
    ]
    # Eliminar duplicados manteniendo el orden
    incoming_codes = list(dict.fromkeys(incoming_codes))

    existing_by_code = {t.tracking_code: t for t in supplier_order.trackings}

    # 1. Eliminar códigos que el usuario quitó del lote
    for code, tracking_obj in list(existing_by_code.items()):
        if code not in incoming_codes:
            db.session.delete(tracking_obj)

    # 2. Crear registros nuevos solo para códigos que no existían
    for code in incoming_codes:
        if code not in existing_by_code:
            new_tracking = SupplierOrderTracking(
                supplier_order_id=supplier_order.id,
                tracking_code=code,
                status="NOT_FOUND",
                is_delivered=False,
            )
            db.session.add(new_tracking)

    # Mantener el campo string legacy sincronizado
    supplier_order.tracking_code = ", ".join(incoming_codes) if incoming_codes else None
```

---

## 5. Lógica de Consulta Inteligente a la API Externa

Cuando el usuario presiona **"Consultar pendientes"** en la vista del lote, el backend ejecuta este flujo:

```python
def check_pending_trackings_for_lot(supplier_order):
    """
    Consulta en la API externa ÚNICAMENTE los códigos donde is_delivered == False.
    """
    pending_trackings = [
        t for t in supplier_order.trackings if not t.is_delivered
    ]

    if not pending_trackings:
        # Todos están entregados, cero llamadas a la API externa
        supplier_order.recalculate_lot_status_from_trackings()
        return supplier_order.trackings

    now = datetime.now(timezone.utc)

    # Llamada en lote (batch) a la API externa (ej. 17TRACK / TrackingMore)
    codes_to_query = [t.tracking_code for t in pending_trackings]
    external_results = query_external_tracking_provider(codes_to_query)

    for tracking in pending_trackings:
        info = external_results.get(tracking.tracking_code)
        tracking.last_checked_at = now

        if not info:
            continue

        tracking.status = info["status"]  # "NOT_FOUND" | "INFO_RECEIVED" | "IN_TRANSIT" | "EXCEPTION" | "DELIVERED"
        tracking.carrier_name = info.get("carrier_name") or tracking.carrier_name
        tracking.last_event_description = info.get("last_event_description")
        tracking.last_event_location = info.get("last_event_location")

        # Si llegó a estado DELIVERED, bloqueamos futuras consultas con is_delivered = True
        if info["status"] == "DELIVERED":
            tracking.is_delivered = True
            tracking.delivered_at = info.get("delivered_at") or now

    # Evaluar si con esta actualización ya están TODOS entregados para pasar el lote a DELIVERED
    supplier_order.recalculate_lot_status_from_trackings()
    db.session.commit()

    return supplier_order.trackings
```

---

## 6. Endpoints REST para el Backend

### 6.1. Respuesta enriquecida en `GET /api/v1/orders/supplier-orders/<id>`
El objeto `SupplierOrder` incluirá el arreglo `trackings`:

```json
{
  "id": 1,
  "code": "19102026",
  "status": "DELIVERED",
  "tracking_code": "4PX3003321087955CN, LP00654321987CN",
  "tracking_url": "https://m.17track.net/es/track-details?nums=4PX3003321087955CN,LP00654321987CN",
  "notes": "Pedido de octubre",
  "created_at": "2026-10-19T00:00:00+00:00",
  "trackings": [
    {
      "id": 10,
      "supplier_order_id": 1,
      "tracking_code": "4PX3003321087955CN",
      "carrier_name": "4PX Express",
      "status": "DELIVERED",
      "is_delivered": true,
      "last_event_description": "Delivered to reception in Bogota/Cucuta",
      "last_checked_at": "2026-11-10T14:22:00+00:00",
      "delivered_at": "2026-11-10T13:50:00+00:00"
    },
    {
      "id": 11,
      "supplier_order_id": 1,
      "tracking_code": "LP00654321987CN",
      "carrier_name": "Cainiao",
      "status": "DELIVERED",
      "is_delivered": true,
      "last_event_description": "Entregado en destino",
      "last_checked_at": "2026-11-12T09:15:00+00:00",
      "delivered_at": "2026-11-12T08:40:00+00:00"
    }
  ]
}
```

### 6.2. Consultar estados pendientes de un lote
- **Endpoint**: `POST /api/v1/orders/supplier-orders/<id>/trackings/sync`
- **Comportamiento**:
  1. Filtra las guías del lote `<id>` que tengan `is_delivered == False`.
  2. Consulta su estado actual en la API externa.
  3. Si alguna guía fue entregada, cambia `is_delivered = True` y `status = "DELIVERED"`.
  4. Si **todas** las guías del lote tienen ahora `is_delivered == True`, actualiza `supplier_order.status = "DELIVERED"`.
  5. Devuelve el lote actualizado con su arreglo `trackings`.

### 6.3. Marcar manualmente una guía individual como entregada (Override manual)
- **Endpoint**: `PATCH /api/v1/orders/supplier-orders/<id>/trackings/<tracking_id>`
- **Body JSON**:
  ```json
  {
    "is_delivered": true,
    "status": "DELIVERED"
  }
  ```
- **Utilidad**: Si algún courier local en Colombia entrega el paquete pero tarda en actualizar el sistema internacional, puedes marcar esa guía como entregada manualmente y el lote aplicará la misma regla automática.

---

## 7. Mapeo de Estados desde 17TRACK API v2.2

Cuando integres **17TRACK API v2.2** (`https://api.17track.net/track/v2.2/gettrackinfo`), su campo ` tag ` principal se traduce directamente a tu columna `status` así:

| Estado en 17TRACK (`latest_status.status`) | Valor en `SupplierOrderTracking.status` | `is_delivered` |
| :--- | :--- | :--- |
| `NotFound` | `"NOT_FOUND"` | `False` |
| `InfoReceived` | `"INFO_RECEIVED"` | `False` |
| `InTransit` / `OutForDelivery` / `AvailableForPickup` | `"IN_TRANSIT"` | `False` |
| `Exception` / `Expired` / `Undelivered` | `"EXCEPTION"` | `False` |
| **`Delivered`** | **`"DELIVERED"`** | **`True`** (Se bloquea para no volver a consultar) |

---

## 8. Qué ya quedó listo en el Frontend (`troncos-system-react`)

1. **Nuevo estado `"DELIVERED"` (`Entregado (Colombia)`)** en [supplier-order-constants.js](file:///c:/Users/ramco/Documents/dev/troncos-system-react/src/components/supplier-orders/supplier-order-constants.js) y su badge morado distintivo en [SupplierOrderStatusBadge.jsx](file:///c:/Users/ramco/Documents/dev/troncos-system-react/src/components/supplier-orders/SupplierOrderStatusBadge.jsx).
2. **Bloqueo de guías ya entregadas (`Cerrado`)** en [TrackingCodesStatusList.jsx](file:///c:/Users/ramco/Documents/dev/troncos-system-react/src/components/supplier-orders/TrackingCodesStatusList.jsx):
   - Cuando una guía está en estado `"DELIVERED"`, muestra el indicador **`Cerrado`** con candado y no vuelve a consultarse al pulsar **"Consultar pendientes"**.
   - Cuando todas las guías del lote pasan a `"DELIVERED"`, dispara automáticamente la actualización del lote a `status: "DELIVERED"`.
3. **Banner de confirmación en tus manos** en [SupplierOrderDetailSheet.jsx](file:///c:/Users/ramco/Documents/dev/troncos-system-react/src/components/supplier-orders/SupplierOrderDetailSheet.jsx):
   - Cuando el lote está en estado `"DELIVERED"` (ya llegó todo a Colombia), aparece un banner con el botón **"Marcar como Recibido (En mis manos)"** para que con un clic lo pases a `"RECEIVED"` cuando ya los hayas ido a buscar.

