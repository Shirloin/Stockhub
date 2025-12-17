import { MovementServiceClient } from "@/proto/movement/movement.client";
import { createGrpcTransport } from "@/lib/grpc-transport";
import type { AdjustmentReason, StockMovement, StockMovementType } from "@/types/stock-movement";
import { useEffect, useState, useRef } from "react";

export function useMovementStream(limit?: number) {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        isMounted.current = true;

        // Create dedicated transport for this hook
        const transport = createGrpcTransport();
        const client = new MovementServiceClient(transport);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const startStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const call = client.watchMovements({
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

                    const movementList = response.movements || [];
                    const mappedMovements: StockMovement[] = movementList.map((m) => ({
                        uuid: m.uuid || "",
                        productUuid: m.productUuid || "",
                        warehouseUuid: m.warehouseUuid || "",
                        product: m.product ? {
                            uuid: m.product.uuid || "",
                            title: m.product.title || "",
                        } : undefined,
                        warehouse: m.warehouse ? {
                            uuid: m.warehouse.uuid || "",
                            name: m.warehouse.name || "",
                        } : undefined,
                        movementType: m.movementType as StockMovementType,
                        quantity: m.quantity || 0,
                        previousQty: m.previousQty || 0,
                        newQty: m.newQty || 0,
                        referenceNumber: m.referenceNumber || "",
                        toWarehouseUuid: m.toWarehouseUuid || "",
                        adjustmentReason: m.adjustmentReason as AdjustmentReason,
                        notes: m.notes || "",
                        createdBy: m.createdBy || "",
                        movementDate: m.movementDate || "",
                        createdAt: m.createdAt || "",
                        updatedAt: m.updatedAt || "",
                    }));

                    if (isMounted.current) {
                        setMovements(mappedMovements);
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
                        console.log("gRPC movement stream closed, will attempt to reconnect...");
                        setTimeout(() => {
                            if (isMounted.current && !abortController.signal.aborted) {
                                startStream();
                            }
                        }, 3000);
                    }
                    return;
                }

                if (isMounted.current) {
                    console.error("gRPC movement stream error:", err);
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

    return { movements, isConnected, isLoading, error };
}

