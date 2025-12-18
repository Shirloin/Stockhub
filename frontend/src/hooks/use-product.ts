import { createProduct, getProducts, getProductsPaginated, updateProduct, deleteProduct, getTopProductsByStock } from "@/api/product";
import type Product from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product: Omit<Product, 'uuid' | 'createdAt' | 'updatedAt'>) => createProduct(product),
        mutationKey: ['createProduct'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, product }: { uuid: string; product: Omit<Product, 'uuid' | 'createdAt' | 'updatedAt'> }) =>
            updateProduct(uuid, product),
        mutationKey: ['updateProduct'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteProduct(uuid),
        mutationKey: ['deleteProduct'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        },
    })
}

export const useGetProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            return await getProducts();
        },
    })
}

export const useGetProductsPaginated = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['products', 'paginated', page, limit],
        queryFn: async () => {
            return await getProductsPaginated(page, limit);
        },
    })
}

export const useGetTopProductsByStock = (limit: number = 5) => {
    return useQuery({
        queryKey: ['topProductsByStock', limit],
        queryFn: async () => {
            return await getTopProductsByStock(limit);
        },
    })
}