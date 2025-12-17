import { ProductServiceClient } from "@/proto/product/product.client";
import { createGrpcTransport } from "@/lib/grpc-transport";
import type Product from "@/types/product";
import { useEffect, useState, useRef } from "react";

export function useTopProductsStream(limit: number = 5) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        isMounted.current = true;

        // Create dedicated transport for this hook
        const transport = createGrpcTransport();
        const client = new ProductServiceClient(transport);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const startStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const call = client.watchTopProductsByPrice({
                    limit: limit || 5,
                }, {
                    abort: abortController.signal
                });

                if (isMounted.current) {
                    setIsConnected(true);
                    setIsLoading(false);
                }

                for await (const response of call.responses) {
                    if (!isMounted.current || abortController.signal.aborted) {
                        break;
                    }

                    const productList = response.products || [];
                    const mappedProducts: Product[] = productList.map((product) => ({
                        uuid: product.uuid,
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        stock: product.stock,
                        lowStockThreshold: product.lowStockThreshold,
                        sku: product.sku,
                        barcode: product.barcode,
                        updatedAt: product.updatedAt,
                    }));

                    if (isMounted.current) {
                        setProducts(mappedProducts);
                        setError(null);
                    }
                }

                if (!abortController.signal.aborted && isMounted.current) {
                    setIsConnected(false);
                }
            } catch (err) {
                const isAbortError =
                    (err instanceof Error && err.name === 'AbortError') ||
                    (err instanceof Error && err.message?.includes('aborted')) ||
                    (err instanceof Error && err.message?.includes('premature EOF')) ||
                    abortController.signal.aborted;

                if (isAbortError) {
                    if (isMounted.current && !abortController.signal.aborted) {
                        // Connection closed, try to reconnect after a delay
                        console.log("gRPC top products stream closed, will attempt to reconnect...");
                        setTimeout(() => {
                            if (isMounted.current && !abortController.signal.aborted) {
                                startStream();
                            }
                        }, 3000);
                    }
                    return;
                }

                if (isMounted.current) {
                    console.error("gRPC top products stream error:", err);
                    setError(err as Error);
                    setIsConnected(false);
                    setIsLoading(false);
                }
            }
        };

        startStream();

        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [limit]);

    return { products, isConnected, isLoading, error };
}

