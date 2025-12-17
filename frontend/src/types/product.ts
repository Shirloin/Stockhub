import type Category from "./category"
import type Supplier from "./supplier"

export default interface Product {
    uuid?: string
    title?: string
    description?: string
    price?: number
    stock?: number
    lowStockThreshold?: number
    sku?: string
    barcode?: string
    imageUrl?: string
    categoryUuid?: string
    supplierUuid?: string
    category?: Category
    supplier?: Supplier
    createdAt?: string
    updatedAt?: string
}

export interface StockAlert {
    productUuid?: string
    productTitle?: string
    currentStock?: number
    threshold?: number
    alertType?: string
    timestamp?: string
}