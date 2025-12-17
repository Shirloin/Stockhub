import type Supplier from "@/types/supplier";
import axios from "./axios";

interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export const createSupplier = async (supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const response = await axios.post<ApiResponse<Supplier>>('/suppliers', supplier);
    return response.data.data;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await axios.get<ApiResponse<Supplier[]>>('/suppliers');
    return response.data.data;
}

export const updateSupplier = async (uuid: string, supplier: Omit<Supplier, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const response = await axios.put<ApiResponse<Supplier>>(`/suppliers/${uuid}`, supplier);
    return response.data.data;
}

export const deleteSupplier = async (uuid: string): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/suppliers/${uuid}`);
}

