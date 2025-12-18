package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/shirloin/stockhub/internal/config"
	"github.com/shirloin/stockhub/internal/database"
)

func main() {
	cfg := config.Load()
	mux := config.NewMux()
	corsConfig := config.NewCORSConfig(cfg)
	grpcServer := config.NewGRPCServer()
	db, err := database.GetInstance()
	if err != nil {
		log.Fatalf("Error getting database instance: %v", err)
		panic(err)
	}
	database.Migrate()

	bootstrapConfig := config.BootstrapConfig{
		DB:         db,
		Mux:        mux,
		CORSConfig: corsConfig,
		GRPCServer: grpcServer,
	}

	config.Bootstrap(&bootstrapConfig)

	wrappedGrpc := corsConfig.SetupGRPCCORS(grpcServer)

	go startHTTPServer(cfg.PORT, bootstrapConfig.Handler)
	go startGRPCServer(cfg.GRPC_PORT, wrappedGrpc)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
}

func startHTTPServer(port string, handler http.Handler) {
	server := &http.Server{
		Addr:    port,
		Handler: handler,
	}
	log.Printf("Server is running on port %s", server.Addr)
	server.ListenAndServe()
}

func startGRPCServer(port string, wrappedGrpc *grpcweb.WrappedGrpcServer) {
	server := &http.Server{
		Addr:    port,
		Handler: wrappedGrpc,
	}

	log.Printf("gRPC-Web server running on %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("gRPC-Web server error: %v", err)
	}
}
