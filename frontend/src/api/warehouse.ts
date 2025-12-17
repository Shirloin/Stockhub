import type { StockTransfer, WarehouseStock } from "@/types/warehouse";
import axios from "./axios";
import type Warehouse from "@/types/warehouse";

interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
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
