import type Product from "./product"
import type Supplier from "./supplier"
import type Warehouse from "./warehouse"

export type StockMovementType = "STOCK_IN" | "STOCK_OUT" | "TRANSFER" | "ADJUSTMENT" | "RESERVATION" | "RELEASE"

export type AdjustmentReason = "DAMAGE" | "LOSS" | "EXPIRED" | "CORRECTION" | "THEFT" | "OTHER"

export interface StockMovement {
    uuid?: string
    productUuid?: string
    warehouseUuid?: string
    product?: Product
    warehouse?: Warehouse
    movementType?: StockMovementType
    quantity?: number
    previousQty?: number
    newQty?: number
    referenceNumber?: string
    toWarehouseUuid?: string
    adjustmentReason?: AdjustmentReason
    notes?: string
    createdBy?: string
    movementDate?: string
    createdAt?: string
    updatedAt?: string
}

export interface StockIn {
    uuid?: string
    productUuid?: string
    warehouseUuid?: string
    product?: Product
    warehouse?: Warehouse
    quantity?: number
    purchaseOrderNo?: string
    supplierUuid?: string
    supplier?: Supplier
    receivedDate?: string
    receivedBy?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

export interface StockOut {
    uuid?: string
    productUuid?: string
    warehouseUuid?: string
    product?: Product
    warehouse?: Warehouse
    quantity?: number
    salesOrderNo?: string
    customerName?: string
    shippedDate?: string
    shippedBy?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

export interface StockAdjustment {
    uuid?: string
    productUuid?: string
    warehouseUuid?: string
    product?: Product
    warehouse?: Warehouse
    quantity?: number
    previousQty?: number
    newQty?: number
    reason?: AdjustmentReason
    adjustedBy?: string
    adjustmentDate?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

