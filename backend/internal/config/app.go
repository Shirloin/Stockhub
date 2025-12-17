package config

import (
	"net/http"

	"github.com/gorilla/mux"
	grpcHandler "github.com/shirloin/stockhub/internal/delivery/grpc/handler"
	"github.com/shirloin/stockhub/internal/delivery/http/handler"
	"github.com/shirloin/stockhub/internal/delivery/http/route"
	"github.com/shirloin/stockhub/internal/repository"
	"github.com/shirloin/stockhub/internal/usecase"
	pbMovement "github.com/shirloin/stockhub/proto/movement"
	pb "github.com/shirloin/stockhub/proto/product"
	pbWarehouse "github.com/shirloin/stockhub/proto/warehouse"
	"google.golang.org/grpc"
	"gorm.io/gorm"
)

type BootstrapConfig struct {
	DB          *gorm.DB
	Mux         *mux.Router
	CORSConfig  *CORSConfig
	Handler     http.Handler
	GRPCServer  *grpc.Server
	GRPCHandler *grpcHandler.GRPCHandler
}

func Bootstrap(config *BootstrapConfig) {

	repositories := repository.InitRepositories(config.DB)
	usecases := usecase.InitUsecases(repositories)
	handlers := handler.InitHandlers(usecases)
	grpcHandlers := grpcHandler.InitGRPCHandler(repositories, usecases)

	pb.RegisterProductServiceServer(config.GRPCServer, grpcHandlers.ProductGRPCHandler)
	pbWarehouse.RegisterWarehouseServiceServer(config.GRPCServer, grpcHandlers.WarehouseGRPCHandler)
	pbMovement.RegisterMovementServiceServer(config.GRPCServer, grpcHandlers.MovementGRPCHandler)

	routeConfig := route.RouteConfig{
		Router:   config.Mux,
		Handlers: handlers,
	}

	routeConfig.Setup(config.Mux)
	config.Handler = config.CORSConfig.SetupCORS(routeConfig.Router)
	config.GRPCHandler = grpcHandlers

}
