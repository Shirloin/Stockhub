package repository

import (
	"gorm.io/gorm"
)

type Repositories struct {
	ProductRepository         *ProductRepository
	CategoryRepository        *CategoryRepository
	SupplierRepository        *SupplierRepository
	WarehouseRepository       *WarehouseRepository
	WarehouseStockRepository  *WarehouseStockRepository
	StockMovementRepository   *StockMovementRepository
	StockInRepository         *StockInRepository
	StockOutRepository        *StockOutRepository
	StockAdjustmentRepository *StockAdjustmentRepository
}

func InitRepositories(db *gorm.DB) *Repositories {
	productRepository := NewProductRepository(db)
	categoryRepository := NewCategoryRepository(db)
	supplierRepository := NewSupplierRepository(db)
	warehouseRepository := NewWarehouseRepository(db)
	warehouseStockRepository := NewWarehouseStockRepository(db)
	stockMovementRepository := NewStockMovementRepository(db)
	stockInRepository := NewStockInRepository(db)
	stockOutRepository := NewStockOutRepository(db)
	stockAdjustmentRepository := NewStockAdjustmentRepository(db)

	return &Repositories{
		ProductRepository:          productRepository,
		CategoryRepository:          categoryRepository,
		SupplierRepository:          supplierRepository,
		WarehouseRepository:         warehouseRepository,
		WarehouseStockRepository:    warehouseStockRepository,
		StockMovementRepository:     stockMovementRepository,
		StockInRepository:           stockInRepository,
		StockOutRepository:          stockOutRepository,
		StockAdjustmentRepository:   stockAdjustmentRepository,
	}
}
