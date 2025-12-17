import { ProductServiceClient } from "@/proto/product/product.client";
import { createGrpcTransport } from "@/lib/grpc-transport";
import type { StockAlert } from "@/types/product";
import { useEffect, useState, useRef } from "react";

export function useStockAlerts() {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
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

                const call = client.watchStockAlerts({}, {
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

                    const alertList = response.alerts || [];

                    const mappedAlerts: StockAlert[] = alertList.map((alert) => ({
                        productUuid: alert.productUuid,
                        productTitle: alert.productTitle,
                        currentStock: alert.currentStock,
                        threshold: alert.threshold,
                        alertType: alert.alertType,
                        timestamp: alert.timestamp,
                    }));


                    if (isMounted.current) {
                        setAlerts(mappedAlerts);
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
                        console.log("gRPC stock alerts stream closed, will attempt to reconnect...");
                        setTimeout(() => {
                            if (isMounted.current && !abortController.signal.aborted) {
                                startStream();
                            }
                        }, 3000);
                    }
                    return;
                }

                if (isMounted.current) {
                    console.error("gRPC stock alerts stream error:", err);
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
    }, []);

    return { alerts, isConnected, isLoading, error };
}
