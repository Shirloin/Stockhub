import { createSupplier, getSuppliers, getSuppliersPaginated, updateSupplier, deleteSupplier } from "@/api/supplier";
import type Supplier from "@/types/supplier";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'>) => createSupplier(supplier),
        mutationKey: ['createSupplier'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, supplier }: { uuid: string; supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'> }) =>
            updateSupplier(uuid, supplier),
        mutationKey: ['updateSupplier'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteSupplier(uuid),
        mutationKey: ['deleteSupplier'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
    })
}

export const useGetSuppliers = () => {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            return await getSuppliers();
        },
    })
}

export const useGetSuppliersPaginated = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['suppliers', 'paginated', page, limit],
        queryFn: async () => {
            return await getSuppliersPaginated(page, limit);
        },
    })
}

