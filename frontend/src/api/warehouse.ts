import type { StockTransfer, WarehouseStock } from "@/types/warehouse";
import axios from "./axios";
import type Warehouse from "@/types/warehouse";

interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    items: T[];
}

export const createWarehouse = async (warehouse: Omit<Warehouse, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> => {
    const response = await axios.post<ApiResponse<Warehouse>>('/warehouses', warehouse);
    return response.data.data;
}

export const getWarehouses = async (includeMetrics: boolean = false, limit?: number): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (includeMetrics) {
        params.append('metrics', 'true');
    }
    if (limit !== undefined && limit > 0) {
        params.append('limit', limit.toString());
    }
    const url = params.toString() ? `/warehouses?${params.toString()}` : '/warehouses';
    const response = await axios.get<ApiResponse<Warehouse[]>>(url);
    return response.data.data;
}

export const getWarehousesPaginated = async (page: number = 1, limit: number = 10, includeMetrics: boolean = false): Promise<PaginatedResponse<Warehouse>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (includeMetrics) {
        params.append('metrics', 'true');
    }
    const url = `/warehouses?${params.toString()}`;
    const response = await axios.get<ApiResponse<PaginatedResponse<Warehouse>>>(url);
    const result = response.data.data as PaginatedResponse<Warehouse>;
    return result;
}

export const getWarehouseStock = async (warehouseUuid: string): Promise<WarehouseStock[]> => {
    const response = await axios.get<ApiResponse<WarehouseStock[]>>(`/warehouses/${warehouseUuid}/stock`);
    return response.data.data;
}

export const updateWarehouse = async (uuid: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await axios.put<ApiResponse<Warehouse>>(`/warehouses/${uuid}`, warehouse);
    return response.data.data;
}

export const deleteWarehouse = async (uuid: string): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/warehouses/${uuid}`);
}

export const addStock = async (stock: Omit<WarehouseStock, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<WarehouseStock> => {
    const response = await axios.post<ApiResponse<WarehouseStock>>('/warehouses/stock', stock);
    return response.data.data;
}

export const transferStock = async (transfer: Omit<StockTransfer, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<StockTransfer> => {
    const response = await axios.post<ApiResponse<StockTransfer>>('/warehouses/transfer', transfer);
    return response.data.data;
}
