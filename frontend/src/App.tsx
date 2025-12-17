import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./lib/query-client";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
