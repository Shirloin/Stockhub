import axios from "./axios";
import type { StockMovement, StockIn, StockOut, StockAdjustment, StockMovementType } from "@/types/stock-movement";

interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

// Stock Movements (Audit Trail)
export const getStockMovements = async (limit?: number): Promise<StockMovement[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axios.get<ApiResponse<StockMovement[]>>(`/stock-movements${params}`);
    return response.data.data;
}

export const getStockMovementsByWarehouse = async (warehouseUuid: string, limit?: number): Promise<StockMovement[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axios.get<ApiResponse<StockMovement[]>>(`/stock-movements/warehouse/${warehouseUuid}${params}`);
    return response.data.data;
}

export const getStockMovementsByProduct = async (productUuid: string, limit?: number): Promise<StockMovement[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axios.get<ApiResponse<StockMovement[]>>(`/stock-movements/product/${productUuid}${params}`);
    return response.data.data;
}

export const getStockMovementsByDateRange = async (startDate: string, endDate: string): Promise<StockMovement[]> => {
    const response = await axios.get<ApiResponse<StockMovement[]>>(`/stock-movements/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
}

export const getStockMovementsByType = async (type: StockMovementType, limit?: number): Promise<StockMovement[]> => {
    const params = limit ? `&limit=${limit}` : '';
    const response = await axios.get<ApiResponse<StockMovement[]>>(`/stock-movements/type?type=${type}${params}`);
    return response.data.data;
}

// Stock IN
export const createStockIn = async (stockIn: Omit<StockIn, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<StockIn> => {
    const response = await axios.post<ApiResponse<StockIn>>('/stock-in', stockIn);
    return response.data.data;
}

export const getStockIns = async (): Promise<StockIn[]> => {
    const response = await axios.get<ApiResponse<StockIn[]>>('/stock-in');
    return response.data.data;
}

export const getStockInsByWarehouse = async (warehouseUuid: string): Promise<StockIn[]> => {
    const response = await axios.get<ApiResponse<StockIn[]>>(`/stock-in/warehouse/${warehouseUuid}`);
    return response.data.data;
}

// Stock OUT
export const createStockOut = async (stockOut: Omit<StockOut, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<StockOut> => {
    const response = await axios.post<ApiResponse<StockOut>>('/stock-out', stockOut);
    return response.data.data;
}

export const getStockOuts = async (): Promise<StockOut[]> => {
    const response = await axios.get<ApiResponse<StockOut[]>>('/stock-out');
    return response.data.data;
}

export const getStockOutsByWarehouse = async (warehouseUuid: string): Promise<StockOut[]> => {
    const response = await axios.get<ApiResponse<StockOut[]>>(`/stock-out/warehouse/${warehouseUuid}`);
    return response.data.data;
}

// Stock Adjustments
export const createStockAdjustment = async (adjustment: Omit<StockAdjustment, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<StockAdjustment> => {
    const response = await axios.post<ApiResponse<StockAdjustment>>('/stock-adjustments', adjustment);
    return response.data.data;
}

export const getStockAdjustments = async (): Promise<StockAdjustment[]> => {
    const response = await axios.get<ApiResponse<StockAdjustment[]>>('/stock-adjustments');
    return response.data.data;
}

export const getStockAdjustmentsByWarehouse = async (warehouseUuid: string): Promise<StockAdjustment[]> => {
    const response = await axios.get<ApiResponse<StockAdjustment[]>>(`/stock-adjustments/warehouse/${warehouseUuid}`);
    return response.data.data;
}

