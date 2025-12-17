import { create } from "zustand";
import type Product from "@/types/product";

type ProductAction = "update" | "delete" | null;

interface SelectedProduct {
  product: Product;
  action: ProductAction;
}

interface ProductStore {
  selectedProduct: SelectedProduct | null;
  setSelectedProduct: (product: Product | null, action: ProductAction) => void;
  clearSelectedProduct: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (product, action) =>
    set({
      selectedProduct: product && action ? { product, action } : null,
    }),
  clearSelectedProduct: () => set({ selectedProduct: null }),
}));

