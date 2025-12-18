package usecase

import "github.com/shirloin/stockhub/internal/repository"

type Usecases struct {
	ProductUsecase         *ProductUseCase
	CategoryUsecase        *CategoryUseCase
	SupplierUsecase        *SupplierUseCase
	WarehouseUsecase       *WarehouseUseCase
	StockMovementUseCase   *StockMovementUseCase
	StockInUseCase         *StockInUseCase
	StockOutUseCase        *StockOutUseCase
	StockAdjustmentUseCase *StockAdjustmentUseCase
}

func InitUsecases(repositories *repository.Repositories) *Usecases {
	productUsecase := NewProductUseCase(repositories.ProductRepository, repositories.WarehouseStockRepository, repositories.WarehouseRepository)
	categoryUsecase := NewCategoryUseCase(repositories.CategoryRepository)
	supplierUsecase := NewSupplierUseCase(repositories.SupplierRepository)
	warehouseUsecase := NewWarehouseUseCase(repositories.WarehouseRepository, repositories.WarehouseStockRepository, repositories.ProductRepository, repositories.StockMovementRepository)
	stockMovementUseCase := NewStockMovementUseCase(repositories.StockMovementRepository, repositories.WarehouseStockRepository, repositories.WarehouseRepository, repositories.ProductRepository)
	stockInUseCase := NewStockInUseCase(repositories.StockInRepository, repositories.StockMovementRepository, repositories.WarehouseStockRepository, repositories.WarehouseRepository, repositories.ProductRepository)
	stockOutUseCase := NewStockOutUseCase(repositories.StockOutRepository, repositories.StockMovementRepository, repositories.WarehouseStockRepository, repositories.WarehouseRepository, repositories.ProductRepository)
	stockAdjustmentUseCase := NewStockAdjustmentUseCase(repositories.StockAdjustmentRepository, repositories.StockMovementRepository, repositories.WarehouseStockRepository, repositories.WarehouseRepository, repositories.ProductRepository)

	return &Usecases{
		ProductUsecase:         productUsecase,
		CategoryUsecase:        categoryUsecase,
		SupplierUsecase:        supplierUsecase,
		WarehouseUsecase:       warehouseUsecase,
		StockMovementUseCase:   stockMovementUseCase,
		StockInUseCase:         stockInUseCase,
		StockOutUseCase:        stockOutUseCase,
		StockAdjustmentUseCase: stockAdjustmentUseCase,
	}
}
