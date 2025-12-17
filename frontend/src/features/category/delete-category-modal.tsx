import { useDeleteCategory } from "@/hooks/use-category";
import { useCategoryStore } from "@/stores/category-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteCategoryModal() {
  const { selectedCategory, clearSelectedCategory } = useCategoryStore();
  const deleteCategory = useDeleteCategory();
  const categoryToDelete =
    selectedCategory?.action === "delete" ? selectedCategory.category : null;
  const open = categoryToDelete !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedCategory();
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete?.uuid) return;
    try {
      await deleteCategory.mutateAsync(categoryToDelete.uuid);
      clearSelectedCategory();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{categoryToDelete?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => clearSelectedCategory()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
          >
            {deleteCategory.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

