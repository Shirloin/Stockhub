import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

const GRPC_URL = import.meta.env.VITE_GRPC_URL || "http://localhost:50051";

if (!GRPC_URL) {
    console.warn("VITE_GRPC_URL is not set, using default: http://localhost:50051");
}

export function createGrpcTransport() {
    return new GrpcWebFetchTransport({
        baseUrl: GRPC_URL,
    });
}

