# Troncos System — Especificación de la API REST

Documentación técnica completa para la integración del **Frontend** con el **Backend (Flask API)**.

---

## 1. Configuración Base

- **Base URL local**: `http://127.0.0.1:5000`
- **Prefijo del módulo de pedidos**: `/api/v1/orders`
- **Headers requeridos en peticiones `POST` y `PUT`**:
  ```http
  Content-Type: application/json
  Accept: application/json
  ```

---

## 2. Estándar Global de Respuestas

Todas las respuestas de la API siguen una estructura uniforme.

### 2.1. Respuesta Exitosa (`200 OK` / `201 Created`)

```json
{
  "status": "success",
  "message": "Mensaje descriptivo de la operación",
  "data": { ... } // Objeto, Arreglo o null
}
```

### 2.2. Respuesta Exitosa Paginada (`GET .../paginated`)

Todos los endpoints terminados en `/paginated` aceptan los query params `?page=1&per_page=10` (máximo `100` por página) y agregan el bloque `meta`:

```json
{
  "status": "success",
  "message": "Paginated items retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 247,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2.3. Respuesta de Error (`400`, `404`, `409`, `422`, `500`)

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción legible del error",
    "details": { ... } // Opcional, presente cuando hay detalles adicionales
  }
}
```

**Códigos de error internos (`error.code`) comunes:**
- `VALIDATION_ERROR` (`422`): Faltan campos obligatorios o valores fuera de rango.
- `NOT_FOUND` / `CUSTOMER_NOT_FOUND` / `CURRENCY_NOT_FOUND` (`404`): El recurso solicitado no existe.
- `DUPLICATE_CODE` / `DUPLICATE_NAME` (`409`): Ya existe un registro con ese código o nombre único.
- `CONFLICT_HAS_MOVEMENTS` / `CONFLICT_HAS_ORDERS` (`409`): No se puede eliminar porque tiene registros hijos asociados.
- `DATABASE_ERROR` (`500`): Error interno al procesar en base de datos.

---

## 3. Endpoints de Estado del Sistema

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Verifica que el servidor principal esté activo. |
| `GET` | `/test-db` | Verifica la conexión activa con la base de datos. |
| `GET` | `/api/v1/orders/health` | Verifica que el blueprint de pedidos esté activo. |

---

## 4. Monedas (`Currencies`)

Base path: `/api/v1/orders/currencies`

### Objeto `Currency`
```json
{
  "id": 1,
  "name": "Colombian Peso",
  "symbol": "COP$",
  "code": "COP",
  "usd_rate": 3300.0,
  "is_active": true
}
```
> **Nota sobre `usd_rate`**: Indica cuántas unidades de esta moneda equivalen a `1 USD` (ej. `USD = 1.0`, `USDT = 1.0`, `COP = 3300.0`, `VES = 730.0`).

### 4.1. Obtener todas las monedas
- **Endpoint**: `GET /api/v1/orders/currencies`
- **Query Params opcionales**:
  - `is_active`: `true` o `false` (filtra solo monedas activas/inactivas).

### 4.2. Obtener monedas paginadas
- **Endpoint**: `GET /api/v1/orders/currencies/paginated`
- **Query Params opcionales**:
  - `page` (int, default `1`)
  - `per_page` (int, default `10`)
  - `search` (string: busca por `name`, `code` o `symbol`)

### 4.3. Obtener una moneda por ID
- **Endpoint**: `GET /api/v1/orders/currencies/<id>`

### 4.4. Crear moneda
- **Endpoint**: `POST /api/v1/orders/currencies`
- **Body JSON**:
  ```json
  {
    "name": "Colombian Peso",
    "symbol": "COP$",
    "code": "COP",
    "usd_rate": 3300.0,
    "is_active": true
  }
  ```
  *(Obligatorios: `name`, `symbol`, `code`)*.

### 4.5. Actualizar moneda (ej. actualizar tasa de cambio)
- **Endpoint**: `PUT /api/v1/orders/currencies/<id>`
- **Body JSON** (todos los campos son opcionales):
  ```json
  {
    "usd_rate": 3700.0,
    "is_active": true
  }
  ```

### 4.6. Eliminar moneda
- **Endpoint**: `DELETE /api/v1/orders/currencies/<id>`
- *(Retorna `409 CONFLICT_HAS_MOVEMENTS` si la moneda ya tiene movimientos registrados).*

---

## 5. Categorías de Movimientos (`Movement Categories`)

Base path: `/api/v1/orders/movement-categories`

### Objeto `MovementCategory`
```json
{
  "id": 1,
  "name": "ORDER_PAYMENT",
  "default_type": "INCOME",
  "description": "Pagos y abonos recibidos de órdenes de clientes"
}
```
> Valores permitidos para `default_type`: `"INCOME"` (Ingreso) o `"EXPENSE"` (Egreso).

### 5.1. Obtener todas las categorías
- **Endpoint**: `GET /api/v1/orders/movement-categories`
- **Query Params opcionales**:
  - `default_type`: `"INCOME"` o `"EXPENSE"`

### 5.2. Obtener categorías paginadas
- **Endpoint**: `GET /api/v1/orders/movement-categories/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `search`, `default_type`

### 5.3. Obtener categoría por ID
- **Endpoint**: `GET /api/v1/orders/movement-categories/<id>`

### 5.4. Crear categoría
- **Endpoint**: `POST /api/v1/orders/movement-categories`
- **Body JSON**:
  ```json
  {
    "name": "SUPPLIER_PAYMENT",
    "default_type": "EXPENSE",
    "description": "Pagos realizados al proveedor de franelas"
  }
  ```
  *(Obligatorio: `name`. `default_type` por defecto es `"INCOME"`).*

### 5.5. Actualizar categoría
- **Endpoint**: `PUT /api/v1/orders/movement-categories/<id>`
- **Body JSON**: `{ "name": "...", "default_type": "EXPENSE", "description": "..." }`

### 5.6. Eliminar categoría
- **Endpoint**: `DELETE /api/v1/orders/movement-categories/<id>`

---

## 6. Movimientos Financieros (`Movements`)

Base path: `/api/v1/orders/movements`

### Objeto `Movement`
```json
{
  "id": 1,
  "movement_type": "INCOME",
  "amount": 81400.0,
  "applied_exchange_rate": 3700.0,
  "amount_usd": 22.0,
  "currency_id": 2,
  "currency_code": "COP",
  "category_id": 1,
  "category_name": "ORDER_PAYMENT",
  "source_id": 15,
  "description": "Pago de orden en pesos",
  "created_at": "2026-10-19T14:30:00+00:00"
}
```
> **Cálculo automático de `amount_usd`**: Al crear un movimiento, si no envías `applied_exchange_rate` ni `amount_usd`, el backend toma automáticamente la tasa actual (`usd_rate`) de la moneda seleccionada, la guarda como "foto" en `applied_exchange_rate` y calcula `amount_usd = round(amount / applied_exchange_rate, 2)`.

### 6.1. Obtener todos los movimientos
- **Endpoint**: `GET /api/v1/orders/movements`
- **Query Params opcionales**:
  - `movement_type`: `"INCOME"` o `"EXPENSE"`
  - `currency_id`: ID de la moneda
  - `category_id`: ID de la categoría
  - `source_id`: ID de la entidad origen (ej. `customer_order_id` cuando es un pago de orden)
  - `search`: texto en `description`

### 6.2. Obtener movimientos paginados
- **Endpoint**: `GET /api/v1/orders/movements/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `movement_type`, `currency_id`, `category_id`, `source_id`, `search`

### 6.3. Obtener movimiento por ID
- **Endpoint**: `GET /api/v1/orders/movements/<id>`

### 6.4. Crear movimiento
- **Endpoint**: `POST /api/v1/orders/movements`
- **Body JSON**:
  ```json
  {
    "amount": 81400,
    "currency_id": 2,
    "category_id": 1,
    "movement_type": "INCOME",
    "source_id": 15,
    "description": "Abono transferencia Bancolombia"
  }
  ```
  *(Obligatorios: `amount`, `currency_id`, `category_id`. Opcionales: `movement_type` [toma el `default_type` de la categoría si se omite], `applied_exchange_rate`, `amount_usd`, `source_id`, `description`)*.

### 6.5. Actualizar movimiento
- **Endpoint**: `PUT /api/v1/orders/movements/<id>`
- **Body JSON**: Cualquiera de los campos anteriores (si cambia `amount`, `currency_id` o `applied_exchange_rate`, recalcula `amount_usd` automáticamente).

### 6.6. Eliminar movimiento
- **Endpoint**: `DELETE /api/v1/orders/movements/<id>`

---

## 7. Clientes (`Customers`)

Base path: `/api/v1/orders/customers`

### Objeto `Customer`
```json
{
  "id": 1,
  "name": "Alejandro",
  "phone": "5804120715526",
  "reference": "Licorería"
}
```

### 7.1. Obtener todos los clientes
- **Endpoint**: `GET /api/v1/orders/customers`
- **Query Params opcionales**:
  - `search`: busca coincidencia parcial en `name`, `phone` o `reference`.
  - `reference`: filtra por referencia/grupo (ej. `"Mario"`, `"Viniles"`, `"Creisi"`).

### 7.2. Obtener clientes paginados
- **Endpoint**: `GET /api/v1/orders/customers/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `search`, `reference`

### 7.3. Obtener cliente por ID
- **Endpoint**: `GET /api/v1/orders/customers/<id>`

### 7.4. Crear cliente
- **Endpoint**: `POST /api/v1/orders/customers`
- **Body JSON**:
  ```json
  {
    "name": "Angel Chacon",
    "phone": "5804147440064",
    "reference": "Mario"
  }
  ```
  *(Obligatorio: `name`. Opcionales: `phone`, `reference`)*.

### 7.5. Actualizar cliente
- **Endpoint**: `PUT /api/v1/orders/customers/<id>`
- **Body JSON**: `{ "name": "...", "phone": "...", "reference": "..." }`

### 7.6. Eliminar cliente
- **Endpoint**: `DELETE /api/v1/orders/customers/<id>`
- *(Retorna `409 CONFLICT_HAS_ORDERS` si el cliente tiene órdenes asociadas).*

---

## 8. Órdenes a Proveedor / Lotes (`Supplier Orders`)

Base path: `/api/v1/orders/supplier-orders`

Permite encapsular una o varias órdenes de clientes (`CustomerOrder`) dentro de un mismo lote/pedido realizado al proveedor.

### Objeto `SupplierOrder`
```json
{
  "id": 1,
  "code": "19102026",
  "status": "IN_TRANSIT",
  "tracking_code": "4PX3003321087955CN",
  "tracking_url": "https://m.17track.net/es/track-details?nums=4PX3003321087955CN",
  "notes": "Pedido del 19 de octubre 2026",
  "created_at": "2026-10-19T00:00:00+00:00"
}
```
> Valores sugeridos para `status`: `"OPEN"`, `"ORDERED"`, `"IN_TRANSIT"`, `"RECEIVED"`.

### 8.1. Obtener todas las órdenes a proveedor
- **Endpoint**: `GET /api/v1/orders/supplier-orders`
- **Query Params opcionales**:
  - `status`: filtra por estado (`OPEN`, `ORDERED`, `IN_TRANSIT`, `RECEIVED`)
  - `search`: busca en `code`, `tracking_code` o `notes`

### 8.2. Obtener órdenes a proveedor paginadas
- **Endpoint**: `GET /api/v1/orders/supplier-orders/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `status`, `search`

### 8.3. Obtener orden a proveedor por ID (incluye las órdenes de clientes asociadas)
- **Endpoint**: `GET /api/v1/orders/supplier-orders/<id>`
- **Respuesta**: Incluye el arreglo `"customer_orders"` con todas las órdenes de clientes y sus productos dentro de este lote.

### 8.4. Crear orden a proveedor (y vincular órdenes de clientes opcionalmente)
- **Endpoint**: `POST /api/v1/orders/supplier-orders`
- **Body JSON**:
  ```json
  {
    "code": "NOV2026-01",
    "status": "OPEN",
    "tracking_code": null,
    "tracking_url": null,
    "notes": "Primer lote de noviembre",
    "customer_order_ids": [12, 13, 14]
  }
  ```
  *(Obligatorio: `code`. Opcionales: `status`, `tracking_code`, `tracking_url`, `notes`, `customer_order_ids`)*.

### 8.5. Actualizar orden a proveedor (o reasignar órdenes de clientes)
- **Endpoint**: `PUT /api/v1/orders/supplier-orders/<id>`
- **Body JSON**: Cualquiera de los campos anteriores. Si se envía `"customer_order_ids": [12, 15]`, actualiza la asignación de órdenes de clientes de ese lote.

### 8.6. Eliminar orden a proveedor
- **Endpoint**: `DELETE /api/v1/orders/supplier-orders/<id>`
- *(Desvincula automáticamente las `CustomerOrder` asociadas poniéndoles `supplier_order_id = null` sin borrar los pedidos de los clientes).*

---

## 9. Órdenes de Clientes (`Customer Orders`)

Base path: `/api/v1/orders/customer-orders`

### Objeto `CustomerOrder`
```json
{
  "id": 10,
  "customer_id": 3,
  "customer_name": "Angel Chacon",
  "supplier_order_id": 1,
  "supplier_order_code": "19102026",
  "delivery_status": "PENDING",
  "payment_status": "UNPAID",
  "total_base_cost_usd": 67.0,
  "total_sale_price_usd": 104.0,
  "profit_usd": 37.0,
  "created_at": "2026-10-19T00:00:00+00:00",
  "products": [
    {
      "id": 25,
      "customer_order_id": 10,
      "name": "Retro 98-99 Fiorentina Home S-XXL",
      "size": "M",
      "base_cost": 19.0,
      "sale_price": 29.0,
      "reference_url": "https://qiuyipifa686868.x.yupoo.com/albums/141727109?uid=1",
      "notes": "Version: Retro | Estampado: Batistuta, 9"
    }
  ]
}
```
> - Valores sugeridos para `delivery_status`: `"PENDING"`, `"IN_TRANSIT"`, `"DELIVERED"`.
> - Valores sugeridos para `payment_status`: `"UNPAID"`, `"PARTIAL"`, `"PAID"`.
> - `supplier_order_id` es `null` cuando la orden del cliente aún no ha sido asignada a un pedido de proveedor.

### 9.1. Obtener todas las órdenes de clientes
- **Endpoint**: `GET /api/v1/orders/customer-orders`
- **Query Params opcionales**:
  - `customer_id` (int): Filtra pedidos de un cliente.
  - `supplier_order_id` (int): Filtra pedidos de un lote a proveedor.
  - `unassigned_only` (`true`/`false`): Si es `true`, devuelve solo las órdenes que aún no tienen `supplier_order_id` asignado (ideal para la pantalla de armar pedido al proveedor).
  - `delivery_status` (string): `"PENDING"`, `"IN_TRANSIT"`, `"DELIVERED"`.
  - `payment_status` (string): `"UNPAID"`, `"PARTIAL"`, `"PAID"`.
  - `include_products` (`true`/`false`, default `true`).

### 9.2. Obtener órdenes de clientes paginadas
- **Endpoint**: `GET /api/v1/orders/customer-orders/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `customer_id`, `supplier_order_id`, `unassigned_only`, `delivery_status`, `payment_status`, `include_products`

### 9.3. Obtener orden de cliente por ID
- **Endpoint**: `GET /api/v1/orders/customer-orders/<id>`

### 9.4. Crear orden de cliente (permite enviar productos anidados en una sola petición)
- **Endpoint**: `POST /api/v1/orders/customer-orders`
- **Body JSON**:
  ```json
  {
    "customer_id": 3,
    "supplier_order_id": null,
    "delivery_status": "PENDING",
    "payment_status": "UNPAID",
    "products": [
      {
        "name": "Real Madrid 26/27 Home Player Version",
        "size": "L",
        "base_cost": 13.0,
        "sale_price": 22.0,
        "reference_url": "https://qiuyipifa686868.x.yupoo.com/albums/226970726?uid=1",
        "notes": "Player Adidas"
      }
    ]
  }
  ```
  *(Obligatorio: `customer_id`. El arreglo `products` es opcional al crear la orden; también puedes agregar productos después mediante `POST /products`)*.

### 9.5. Actualizar orden de cliente (ej. asignar a orden de proveedor o cambiar estado)
- **Endpoint**: `PUT /api/v1/orders/customer-orders/<id>`
- **Body JSON**:
  ```json
  {
    "supplier_order_id": 1,
    "delivery_status": "DELIVERED",
    "payment_status": "PAID"
  }
  ```

### 9.6. Eliminar orden de cliente
- **Endpoint**: `DELETE /api/v1/orders/customer-orders/<id>`
- *(Elimina en cascada los `products` pertenecientes a esa orden).*

---

## 10. Productos de la Orden (`Products`)

Base path: `/api/v1/orders/products`

### Objeto `Product`
```json
{
  "id": 25,
  "customer_order_id": 10,
  "name": "Retro 98-99 Fiorentina Home S-XXL",
  "size": "M",
  "base_cost": 19.0,
  "sale_price": 29.0,
  "reference_url": "https://qiuyipifa686868.x.yupoo.com/albums/141727109?uid=1",
  "notes": "Version: Retro | Estampado: Batistuta, 9"
}
```
> `size` es `nullable` (`null` para productos sin talla como *Loose namesets* o parches sueltos).

### 10.1. Obtener todos los productos
- **Endpoint**: `GET /api/v1/orders/products`
- **Query Params opcionales**:
  - `customer_order_id` (int)
  - `size` (string: ej. `"S"`, `"M"`, `"L"`, `"XL"`, `"2XL"`)
  - `search` (string: busca en `name` o `notes`)

### 10.2. Obtener productos paginados
- **Endpoint**: `GET /api/v1/orders/products/paginated`
- **Query Params opcionales**:
  - `page`, `per_page`, `customer_order_id`, `size`, `search`

### 10.3. Obtener producto por ID
- **Endpoint**: `GET /api/v1/orders/products/<id>`

### 10.4. Crear producto dentro de una orden
- **Endpoint**: `POST /api/v1/orders/products`
- **Body JSON**:
  ```json
  {
    "customer_order_id": 10,
    "name": "Argentina 2026 Home Player Version",
    "size": "M",
    "base_cost": 16.0,
    "sale_price": 26.0,
    "reference_url": "https://qiuyipifa686868.x.yupoo.com/albums/257747168?uid=1",
    "notes": "Player Adidas | Estampado: Messi, 10"
  }
  ```
  *(Obligatorios: `customer_order_id`, `name`)*.

### 10.5. Actualizar producto
- **Endpoint**: `PUT /api/v1/orders/products/<id>`
- **Body JSON**: Cualquiera de los campos (`name`, `size`, `base_cost`, `sale_price`, `reference_url`, `notes`, `customer_order_id`).

### 10.6. Eliminar producto
- **Endpoint**: `DELETE /api/v1/orders/products/<id>`
