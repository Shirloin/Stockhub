import type Product from "@/types/product";
import axios from "./axios";

interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export const createProduct = async (product: Omit<Product, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await axios.post<ApiResponse<Product>>('/products', product);
    return response.data.data;
}

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get<ApiResponse<Product[]>>('/products');
    return response.data.data;
}

export const updateProduct = async (uuid: string, product: Omit<Product, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await axios.put<ApiResponse<Product>>(`/products/${uuid}`, product);
    return response.data.data;
}

export const deleteProduct = async (uuid: string): Promise<void> => {
    await axios.delete<ApiResponse<null>>(`/products/${uuid}`);
}

export const getTopProductsByStock = async (limit: number = 5): Promise<Product[]> => {
    const response = await axios.get<ApiResponse<Product[]>>(`/products/top-by-stock?limit=${limit}`);
    return response.data.data;
}