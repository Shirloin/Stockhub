import { useState } from "react";
import { useUpdateCategory } from "@/hooks/use-category";
import { useCategoryStore } from "@/stores/category-store";
import type Category from "@/types/category";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function UpdateCategoryForm({ categoryToUpdate }: { categoryToUpdate: Category }) {
  const updateCategory = useUpdateCategory();
  const { clearSelectedCategory } = useCategoryStore();

  const [formData, setFormData] = useState({
    name: categoryToUpdate.name || "",
    description: categoryToUpdate.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory.mutateAsync({
        uuid: categoryToUpdate.uuid!,
        category: {
          name: formData.name,
          description: formData.description,
        },
      });
      clearSelectedCategory();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="update-name">Name *</Label>
          <Input
            id="update-name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Enter category name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-description">Description</Label>
          <Textarea
            id="update-description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter category description"
            rows={4}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => clearSelectedCategory()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          className="bg-black text-white hover:bg-black/90"
          disabled={updateCategory.isPending}
        >
          {updateCategory.isPending ? "Updating..." : "Update Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UpdateCategoryModal() {
  const { selectedCategory, clearSelectedCategory } = useCategoryStore();
  const categoryToUpdate =
    selectedCategory?.action === "update" ? selectedCategory.category : null;
  const open = categoryToUpdate !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedCategory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Update the category information below.
          </DialogDescription>
        </DialogHeader>
        {categoryToUpdate && (
          <UpdateCategoryForm
            key={categoryToUpdate.uuid}
            categoryToUpdate={categoryToUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

