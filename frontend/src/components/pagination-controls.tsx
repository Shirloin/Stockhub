import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  itemName?: string; // e.g., "warehouses", "products", etc.
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  itemName = "items",
}: PaginationControlsProps) {
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      {/* Info and Limit Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-wrap">
          {totalPages > 0 && (
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Items per page:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                onLimitChange(Number(value));
                onPageChange(1); // Reset to first page when limit changes
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 items-center">
          {/* Navigation Buttons */}
          {totalPages > 0 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => onPageChange(1)}
                disabled={page === 1 || totalPages <= 1}
                aria-label="Go to first page"
                className="disabled:cursor-not-allowed"
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1 || totalPages <= 1}
                aria-label="Go to previous page"
                className="disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    {pageNumbers.map((pageNum, index) => {
                      if (
                        pageNum === "ellipsis-start" ||
                        pageNum === "ellipsis-end"
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      const num = pageNum as number;
                      return (
                        <PaginationItem key={num}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onPageChange(num);
                            }}
                            isActive={page === num}
                            className="cursor-pointer min-w-10"
                            aria-label={`Go to page ${num}`}
                          >
                            {num}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  </PaginationContent>
                </Pagination>
              )}

              <Button
                variant="outline"
                size="default"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages || totalPages <= 1}
                aria-label="Go to next page"
                className="disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages || totalPages <= 1}
                aria-label="Go to last page"
                className="disabled:cursor-not-allowed"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            {itemName}
          </div>
        </div>
      </div>
    </div>
  );
}
