import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getStockMovements,
    getStockMovementsPaginated,
    getStockMovementsByWarehouse,
    getStockMovementsByProduct,
    getStockMovementsByDateRange,
    getStockMovementsByType,
    getStockMovementsByTypePaginated,
    createStockIn,
    getStockIns,
    getStockInsByWarehouse,
    createStockOut,
    getStockOuts,
    getStockOutsByWarehouse,
    createStockAdjustment,
    getStockAdjustments,
    getStockAdjustmentsByWarehouse,
} from "@/api/stock-movement";
import type { StockIn, StockOut, StockAdjustment, StockMovementType } from "@/types/stock-movement";

// Stock Movements
export const useGetStockMovements = (limit?: number) => {
    return useQuery({
        queryKey: ['stockMovements', limit],
        queryFn: () => getStockMovements(limit),
    });
}

export const useGetStockMovementsByWarehouse = (warehouseUuid: string, limit?: number) => {
    return useQuery({
        queryKey: ['stockMovements', 'warehouse', warehouseUuid, limit],
        queryFn: () => getStockMovementsByWarehouse(warehouseUuid, limit),
        enabled: !!warehouseUuid,
    });
}

export const useGetStockMovementsByProduct = (productUuid: string, limit?: number) => {
    return useQuery({
        queryKey: ['stockMovements', 'product', productUuid, limit],
        queryFn: () => getStockMovementsByProduct(productUuid, limit),
        enabled: !!productUuid,
    });
}

export const useGetStockMovementsByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['stockMovements', 'dateRange', startDate, endDate],
        queryFn: () => getStockMovementsByDateRange(startDate, endDate),
        enabled: !!startDate && !!endDate,
    });
}

export const useGetStockMovementsByType = (type: StockMovementType, limit?: number) => {
    return useQuery({
        queryKey: ['stockMovements', 'type', type, limit],
        queryFn: () => getStockMovementsByType(type, limit),
    });
}

export const useGetStockMovementsPaginated = (
    page: number = 1,
    limit: number = 10,
    type?: StockMovementType | "ALL"
) => {
    return useQuery({
        queryKey: ['stockMovements', 'paginated', page, limit, type],
        queryFn: () => getStockMovementsPaginated(page, limit, type),
    });
}

export const useGetStockMovementsByTypePaginated = (type: StockMovementType, page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['stockMovements', 'type', 'paginated', type, page, limit],
        queryFn: () => getStockMovementsByTypePaginated(type, page, limit),
    });
}

// Stock IN
export const useCreateStockIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stockIn: Omit<StockIn, 'uuid' | 'createdAt' | 'updatedAt'>) => createStockIn(stockIn),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stockIns'] });
            queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export const useGetStockIns = () => {
    return useQuery({
        queryKey: ['stockIns'],
        queryFn: getStockIns,
    });
}

export const useGetStockInsByWarehouse = (warehouseUuid: string) => {
    return useQuery({
        queryKey: ['stockIns', 'warehouse', warehouseUuid],
        queryFn: () => getStockInsByWarehouse(warehouseUuid),
        enabled: !!warehouseUuid,
    });
}

// Stock OUT
export const useCreateStockOut = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stockOut: Omit<StockOut, 'uuid' | 'createdAt' | 'updatedAt'>) => createStockOut(stockOut),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stockOuts'] });
            queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export const useGetStockOuts = () => {
    return useQuery({
        queryKey: ['stockOuts'],
        queryFn: getStockOuts,
    });
}

export const useGetStockOutsByWarehouse = (warehouseUuid: string) => {
    return useQuery({
        queryKey: ['stockOuts', 'warehouse', warehouseUuid],
        queryFn: () => getStockOutsByWarehouse(warehouseUuid),
        enabled: !!warehouseUuid,
    });
}

// Stock Adjustments
export const useCreateStockAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (adjustment: Omit<StockAdjustment, 'uuid' | 'createdAt' | 'updatedAt'>) => createStockAdjustment(adjustment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] });
            queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export const useGetStockAdjustments = () => {
    return useQuery({
        queryKey: ['stockAdjustments'],
        queryFn: getStockAdjustments,
    });
}

export const useGetStockAdjustmentsByWarehouse = (warehouseUuid: string) => {
    return useQuery({
        queryKey: ['stockAdjustments', 'warehouse', warehouseUuid],
        queryFn: () => getStockAdjustmentsByWarehouse(warehouseUuid),
        enabled: !!warehouseUuid,
    });
}

