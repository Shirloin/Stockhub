import { useGetCategories } from "@/hooks/use-category";
import type Category from "@/types/category";
import CreateCategoryModal from "./create-category-modal";
import UpdateCategoryModal from "./update-category-modal";
import DeleteCategoryModal from "./delete-category-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategoryStore } from "@/stores/category-store";

export default function CategoryList() {
  const { data: categories, isLoading, error } = useGetCategories();
  const { setSelectedCategory } = useCategoryStore();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Loading categories...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-destructive">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product categories
          </p>
        </div>
        <CreateCategoryModal />
      </div>

      {categories && categories.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: Category) => (
                <TableRow key={category.uuid}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCategory(category, "update")}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCategory(category, "delete")}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p className="text-lg">No categories found.</p>
          <p className="text-sm mt-2">
            Create your first category to get started.
          </p>
        </div>
      )}

      <UpdateCategoryModal />
      <DeleteCategoryModal />
    </div>
  );
}
