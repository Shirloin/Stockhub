import { createCategory, getCategories, getCategoriesPaginated, updateCategory, deleteCategory } from "@/api/category";
import type Category from "@/types/category";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (category: Omit<Category, 'uuid' | 'createdAt' | 'updatedAt'>) => createCategory(category),
        mutationKey: ['createCategory'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, category }: { uuid: string; category: Omit<Category, 'uuid' | 'createdAt' | 'updatedAt'> }) =>
            updateCategory(uuid, category),
        mutationKey: ['updateCategory'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteCategory(uuid),
        mutationKey: ['deleteCategory'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export const useGetCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            return await getCategories();
        },
    })
}

export const useGetCategoriesPaginated = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['categories', 'paginated', page, limit],
        queryFn: async () => {
            return await getCategoriesPaginated(page, limit);
        },
    })
}

