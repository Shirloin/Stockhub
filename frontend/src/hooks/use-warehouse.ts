import { createWarehouse, getWarehouses, getWarehouseStock, addStock, transferStock, updateWarehouse, deleteWarehouse } from "@/api/warehouse";
import type Warehouse from "@/types/warehouse";
import type { WarehouseStock, StockTransfer } from "@/types/warehouse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (warehouse: Omit<Warehouse, 'uuid' | 'createdAt' | 'updatedAt'>) => createWarehouse(warehouse),
        mutationKey: ['createWarehouse'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export const useUpdateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, warehouse }: { uuid: string; warehouse: Partial<Warehouse> }) =>
            updateWarehouse(uuid, warehouse),
        mutationKey: ['updateWarehouse'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export const useDeleteWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteWarehouse(uuid),
        mutationKey: ['deleteWarehouse'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

export const useGetWarehouses = (includeMetrics: boolean = false, limit?: number) => {
    return useQuery({
        queryKey: ['warehouses', includeMetrics, limit],
        queryFn: async () => {
            return await getWarehouses(includeMetrics, limit);
        },
    })
}

export const useGetWarehouseStock = (warehouseUuid: string) => {
    return useQuery({
        queryKey: ['warehouseStock', warehouseUuid],
        queryFn: async () => {
            return await getWarehouseStock(warehouseUuid);
        },
        enabled: !!warehouseUuid,
    })
}

export const useAddStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stock: Omit<WarehouseStock, 'uuid' | 'createdAt' | 'updatedAt'>) => addStock(stock),
        mutationKey: ['addStock'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseStock'] })
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export const useTransferStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (transfer: Omit<StockTransfer, 'uuid' | 'createdAt' | 'updatedAt'>) => transferStock(transfer),
        mutationKey: ['transferStock'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseStock'] })
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}
