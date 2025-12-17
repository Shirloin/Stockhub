package handler

import (
	"github.com/shirloin/stockhub/internal/repository"
	"github.com/shirloin/stockhub/internal/usecase"
)

type GRPCHandler struct {
	ProductGRPCHandler   *ProductGRPCHandler
	WarehouseGRPCHandler *WarehouseGRPCHandler
	MovementGRPCHandler  *MovementGRPCHandler
}

func InitGRPCHandler(repositories *repository.Repositories, usecases *usecase.Usecases) *GRPCHandler {
	return &GRPCHandler{
		ProductGRPCHandler:   NewProductGRPCHandler(repositories.ProductRepository),
		WarehouseGRPCHandler: NewWarehouseGRPCHandler(repositories.WarehouseRepository, repositories.WarehouseStockRepository, usecases.WarehouseUsecase),
		MovementGRPCHandler:  NewMovementGRPCHandler(repositories.StockMovementRepository),
	}
}
