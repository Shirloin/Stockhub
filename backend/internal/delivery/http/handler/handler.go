package handler

import (
	"github.com/shirloin/stockhub/internal/usecase"
)

type Handler struct {
	ProductHandler         *ProductHandler
	CategoryHandler        *CategoryHandler
	SupplierHandler        *SupplierHandler
	WarehouseHandler       *WarehouseHandler
	StockMovementHandler   *StockMovementHandler
	StockInHandler         *StockInHandler
	StockOutHandler        *StockOutHandler
	StockAdjustmentHandler *StockAdjustmentHandler
}

func InitHandlers(usecases *usecase.Usecases) *Handler {
	return &Handler{
		ProductHandler:         NewProductHandler(usecases.ProductUsecase),
		CategoryHandler:        NewCategoryHandler(usecases.CategoryUsecase),
		SupplierHandler:        NewSupplierHandler(usecases.SupplierUsecase),
		WarehouseHandler:       NewWarehouseHandler(usecases.WarehouseUsecase),
		StockMovementHandler:   NewStockMovementHandler(usecases.StockMovementUseCase),
		StockInHandler:         NewStockInHandler(usecases.StockInUseCase),
		StockOutHandler:        NewStockOutHandler(usecases.StockOutUseCase),
		StockAdjustmentHandler: NewStockAdjustmentHandler(usecases.StockAdjustmentUseCase),
	}
}
