import { WarehouseServiceClient } from "@/proto/warehouse/warehouse.client";
import { createGrpcTransport } from "@/lib/grpc-transport";
import type Warehouse from "@/types/warehouse";
import { useEffect, useState, useRef } from "react";

export function useWarehouseStream(includeMetrics: boolean = false, limit?: number) {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        isMounted.current = true;

        // Create dedicated transport for this hook
        const transport = createGrpcTransport();
        const client = new WarehouseServiceClient(transport);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const startStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const call = client.watchWarehouses({
                    includeMetrics,
                    limit: limit || 0,
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

                    const warehouseList = response.warehouses || [];
                    const mappedWarehouses: Warehouse[] = warehouseList.map((w) => ({
                        uuid: w.warehouse?.uuid || "",
                        name: w.warehouse?.name || "",
                        address: w.warehouse?.address || "",
                        city: w.warehouse?.city || "",
                        state: w.warehouse?.state || "",
                        country: w.warehouse?.country || "",
                        postalCode: w.warehouse?.postalCode || "",
                        managerName: w.warehouse?.managerName || "",
                        managerEmail: w.warehouse?.managerEmail || "",
                        managerPhone: w.warehouse?.managerPhone || "",
                        capacity: w.warehouse?.capacity || 0,
                        isActive: w.warehouse?.isActive || true,
                        createdAt: w.warehouse?.createdAt || "",
                        updatedAt: w.warehouse?.updatedAt || "",
                        totalStock: w.totalStock || 0,
                        utilization: w.utilization || 0,
                    }));

                    if (isMounted.current) {
                        setWarehouses(mappedWarehouses);
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
                        console.log("gRPC warehouse stream closed, will attempt to reconnect...");
                        setTimeout(() => {
                            if (isMounted.current && !abortController.signal.aborted) {
                                startStream();
                            }
                        }, 3000);
                    }
                    return;
                }

                if (isMounted.current) {
                    console.error("gRPC warehouse stream error:", err);
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
    }, [includeMetrics, limit]);

    return { warehouses, isConnected, isLoading, error };
}

