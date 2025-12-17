package usecase

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
)

type WarehouseUseCase struct {
	warehouseRepository      *repository.WarehouseRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	productRepository        *repository.ProductRepository
}

func NewWarehouseUseCase(warehouseRepository *repository.WarehouseRepository, warehouseStockRepository *repository.WarehouseStockRepository, productRepository *repository.ProductRepository) *WarehouseUseCase {
	return &WarehouseUseCase{
		warehouseRepository:      warehouseRepository,
		warehouseStockRepository: warehouseStockRepository,
		productRepository:        productRepository,
	}
}

func (w *WarehouseUseCase) Create(ctx context.Context, warehouse *domain.Warehouse) error {
	if warehouse.Name == "" {
		return domain.ErrWarehouseNameRequired
	}
	return w.warehouseRepository.Create(ctx, warehouse)
}

func (w *WarehouseUseCase) GetAll(ctx context.Context) ([]domain.Warehouse, error) {
	return w.warehouseRepository.GetAll(ctx)
}

func (w *WarehouseUseCase) GetAllWithMetrics(ctx context.Context, limit int) ([]domain.WarehouseWithMetrics, error) {
	return w.warehouseRepository.GetAllWithMetrics(ctx, limit)
}

func (w *WarehouseUseCase) GetByID(ctx context.Context, uuid string) (*domain.Warehouse, error) {
	return w.warehouseRepository.GetByID(ctx, uuid)
}

func (w *WarehouseUseCase) Update(ctx context.Context, uuid string, warehouse *domain.Warehouse) error {
	existing, err := w.warehouseRepository.GetByID(ctx, uuid)
	if err != nil {
		return err
	}
	warehouse.UUID = existing.UUID
	warehouse.CreatedAt = existing.CreatedAt
	return w.warehouseRepository.Update(ctx, uuid, warehouse)
}

func (w *WarehouseUseCase) Delete(ctx context.Context, uuid string) error {
	return w.warehouseRepository.Delete(ctx, uuid)
}

func (w *WarehouseUseCase) TransferStock(ctx context.Context, transfer *domain.StockTransfer) error {
	if transfer.Quantity <= 0 {
		return domain.ErrQuantityInvalid
	}

	if transfer.TransferDate.IsZero() {
		transfer.TransferDate = time.Now()
	}

	// Transfer is a transaction between warehouses - does not affect product catalog (master data)
	// Product.Stock remains unchanged as it represents available stock in catalog
	if err := w.warehouseStockRepository.Transfer(ctx, transfer); err != nil {
		return err
	}

	// Update both warehouse's updated_at timestamps to trigger real-time updates
	fromWarehouse, err := w.warehouseRepository.GetByID(ctx, transfer.FromWarehouseUUID)
	if err != nil {
		return err
	}
	fromWarehouse.UpdatedAt = time.Now()
	if err := w.warehouseRepository.Update(ctx, transfer.FromWarehouseUUID, fromWarehouse); err != nil {
		return err
	}

	toWarehouse, err := w.warehouseRepository.GetByID(ctx, transfer.ToWarehouseUUID)
	if err != nil {
		return err
	}
	toWarehouse.UpdatedAt = time.Now()
	if err := w.warehouseRepository.Update(ctx, transfer.ToWarehouseUUID, toWarehouse); err != nil {
		return err
	}

	return nil
}

func (w *WarehouseUseCase) GetWarehouseStock(ctx context.Context, warehouseUUID string) ([]domain.WarehouseStock, error) {
	return w.warehouseStockRepository.GetByWarehouse(ctx, warehouseUUID)
}

func (w *WarehouseUseCase) AddStock(ctx context.Context, stock *domain.WarehouseStock) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if stock.Quantity <= 0 {
		return domain.ErrQuantityInvalid
	}

	// Get warehouse to check capacity
	warehouse, err := w.warehouseRepository.GetByID(ctx, stock.WarehouseUUID)
	if err != nil {
		return err
	}

	// Get current total stock in warehouse (capacity usage)
	currentTotalStock, err := w.warehouseStockRepository.GetTotalStockByWarehouse(ctx, stock.WarehouseUUID)
	if err != nil {
		return err
	}

	// Check warehouse capacity if it's set (> 0)
	if warehouse.Capacity > 0 {
		newTotalStock := currentTotalStock + stock.Quantity
		if newTotalStock > warehouse.Capacity {
			return domain.ErrWarehouseCapacityExceeded
		}
	}

	// Get existing warehouse stock or create new
	existing, err := w.warehouseStockRepository.GetByProductAndWarehouse(ctx, stock.ProductUUID, stock.WarehouseUUID)
	if err != nil && err.Error() != "record not found" {
		return err
	}

	if existing != nil {
		existing.Quantity += stock.Quantity
		existing.AvailableQty = existing.Quantity - existing.ReservedQty
		if err := w.warehouseStockRepository.CreateOrUpdate(ctx, existing); err != nil {
			return err
		}
	} else {
		stock.AvailableQty = stock.Quantity - stock.ReservedQty
		if err := w.warehouseStockRepository.CreateOrUpdate(ctx, stock); err != nil {
			return err
		}
	}

	// Update warehouse's updated_at timestamp to trigger real-time updates
	warehouse, err = w.warehouseRepository.GetByID(ctx, stock.WarehouseUUID)
	if err != nil {
		return err
	}
	warehouse.UpdatedAt = time.Now()
	if err := w.warehouseRepository.Update(ctx, stock.WarehouseUUID, warehouse); err != nil {
		return err
	}

	return nil
}
