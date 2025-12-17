import { create } from "zustand";
import type Warehouse from "@/types/warehouse";

type WarehouseAction = "update" | "delete" | "stock" | "transfer";

interface SelectedWarehouse {
  warehouse: Warehouse;
  action: WarehouseAction;
}

interface WarehouseStore {
  selectedWarehouse: SelectedWarehouse | null;
  setSelectedWarehouse: (warehouse: Warehouse, action: WarehouseAction) => void;
  clearSelectedWarehouse: () => void;
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
  selectedWarehouse: null,
  setSelectedWarehouse: (warehouse, action) =>
    set({ selectedWarehouse: { warehouse, action } }),
  clearSelectedWarehouse: () => set({ selectedWarehouse: null }),
}));
