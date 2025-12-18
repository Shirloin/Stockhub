import type Category from "@/types/category";
import axios from "./axios";

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

export const createCategory = async (category: Omit<Category, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const response = await axios.post<ApiResponse<Category>>('/categories', category);
    return response.data.data;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await axios.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
}

export const getCategoriesPaginated = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Category>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await axios.get<ApiResponse<PaginatedResponse<Category>>>(`/categories?${params.toString()}`);
    return response.data.data as PaginatedResponse<Category>;
}

export const updateCategory = async (uuid: string, category: Omit<Category, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const response = await axios.put<ApiResponse<Category>>(`/categories/${uuid}`, category);
    return response.data.data;
}

export const deleteCategory = async (uuid: string): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/categories/${uuid}`);
}

