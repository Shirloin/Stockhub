import type Supplier from "@/types/supplier";
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

export const createSupplier = async (supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const response = await axios.post<ApiResponse<Supplier>>('/suppliers', supplier);
    return response.data.data;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await axios.get<ApiResponse<Supplier[]>>('/suppliers');
    return response.data.data;
}

export const getSuppliersPaginated = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Supplier>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await axios.get<ApiResponse<PaginatedResponse<Supplier>>>(`/suppliers?${params.toString()}`);
    return response.data.data as PaginatedResponse<Supplier>;
}

export const updateSupplier = async (uuid: string, supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const response = await axios.put<ApiResponse<Supplier>>(`/suppliers/${uuid}`, supplier);
    return response.data.data;
}

export const deleteSupplier = async (uuid: string): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/suppliers/${uuid}`);
}

