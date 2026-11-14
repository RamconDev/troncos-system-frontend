import * as React from "react"
import { SupplierOrderTrackingWidget } from "@/components/supplier-orders/SupplierOrderTrackingWidget"

/**
 * Componente heredado: redirige a la implementación moderna SupplierOrderTrackingWidget
 */
export function TrackingCodesStatusList({
  trackingCode,
  trackingItems = null,
  lotStatus = "OPEN",
  lot = null,
  onAllPackagesDelivered = null,
}) {
  const lotObject = lot || {
    id: null,
    tracking_code: trackingCode,
    trackings: trackingItems,
    status: lotStatus,
  }

  return (
    <SupplierOrderTrackingWidget
      lot={lotObject}
      onLotUpdated={onAllPackagesDelivered}
    />
  )
}
