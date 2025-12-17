import { create } from "zustand";
import type Supplier from "@/types/supplier";

type SupplierAction = "update" | "delete";

interface SelectedSupplier {
  supplier: Supplier;
  action: SupplierAction;
}

interface SupplierStore {
  selectedSupplier: SelectedSupplier | null;
  setSelectedSupplier: (supplier: Supplier, action: SupplierAction) => void;
  clearSelectedSupplier: () => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  selectedSupplier: null,
  setSelectedSupplier: (supplier, action) =>
    set({ selectedSupplier: { supplier, action } }),
  clearSelectedSupplier: () => set({ selectedSupplier: null }),
}));

