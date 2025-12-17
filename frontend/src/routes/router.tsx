import Layout from "@/layouts/layout";
import CategoriesPage from "@/pages/categories-page";
import SuppliersPage from "@/pages/suppliers-page";
import WarehousesPage from "@/pages/warehouses-page";
import StockMovementsPage from "@/pages/stock-movements-page";
import DashboardPage from "@/pages/dashboard-page";
import { createBrowserRouter } from "react-router-dom";
import ProductPage from "@/pages/product-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/products",
        element: <ProductPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/suppliers",
        element: <SuppliersPage />,
      },
      {
        path: "/warehouses",
        element: <WarehousesPage />,
      },
      {
        path: "/stock-movements",
        element: <StockMovementsPage />,
      },
    ],
  },
]);

export default router;
