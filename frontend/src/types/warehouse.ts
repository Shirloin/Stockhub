export default interface Warehouse {
    uuid?: string
    name?: string
    address?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    managerName?: string
    managerEmail?: string
    managerPhone?: string
    capacity?: number
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
    totalStock?: number  // Total stock currently in warehouse
    utilization?: number // Utilization percentage (0-100)
}

export interface WarehouseStock {
    uuid?: string
    productUuid?: string
    warehouseUuid?: string
    quantity?: number
    aisle?: string
    rack?: string
    shelf?: string
    product?: any
    warehouse?: Warehouse
    createdAt?: string
    updatedAt?: string
}

export interface StockTransfer {
    uuid?: string
    productUuid?: string
    fromWarehouseUuid?: string
    toWarehouseUuid?: string
    quantity?: number
    transferDate?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}
