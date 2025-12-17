import { create } from "zustand";
import type Category from "@/types/category";

type CategoryAction = "update" | "delete";

interface SelectedCategory {
  category: Category;
  action: CategoryAction;
}

interface CategoryStore {
  selectedCategory: SelectedCategory | null;
  setSelectedCategory: (category: Category, action: CategoryAction) => void;
  clearSelectedCategory: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category, action) =>
    set({ selectedCategory: { category, action } }),
  clearSelectedCategory: () => set({ selectedCategory: null }),
}));

