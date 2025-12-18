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
	stockMovementRepository  *repository.StockMovementRepository
}

func NewWarehouseUseCase(warehouseRepository *repository.WarehouseRepository, warehouseStockRepository *repository.WarehouseStockRepository, productRepository *repository.ProductRepository, stockMovementRepository *repository.StockMovementRepository) *WarehouseUseCase {
	return &WarehouseUseCase{
		warehouseRepository:      warehouseRepository,
		warehouseStockRepository: warehouseStockRepository,
		productRepository:        productRepository,
		stockMovementRepository:  stockMovementRepository,
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

func (w *WarehouseUseCase) GetAllPaginated(ctx context.Context, page, limit int) ([]domain.Warehouse, int64, error) {
	warehouses, err := w.warehouseRepository.GetAllPaginated(ctx, page, limit)
	if err != nil {
		return nil, 0, err
	}
	total, err := w.warehouseRepository.Count(ctx)
	if err != nil {
		return nil, 0, err
	}
	return warehouses, total, nil
}

func (w *WarehouseUseCase) GetAllWithMetricsPaginated(ctx context.Context, page, limit int) ([]domain.WarehouseWithMetrics, int64, error) {
	return w.warehouseRepository.GetAllWithMetricsPaginated(ctx, page, limit)
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

	// Get current stock levels for movement records
	fromStock, err := w.warehouseStockRepository.GetByProductAndWarehouse(ctx, transfer.ProductUUID, transfer.FromWarehouseUUID)
	if err != nil {
		return err
	}
	if fromStock == nil {
		return domain.ErrInsufficientStock
	}

	toStock, err := w.warehouseStockRepository.GetByProductAndWarehouse(ctx, transfer.ProductUUID, transfer.ToWarehouseUUID)
	if err != nil {
		return err
	}

	fromPreviousQty := fromStock.Quantity
	fromNewQty := fromPreviousQty - transfer.Quantity

	var toPreviousQty int
	var toNewQty int
	if toStock != nil {
		toPreviousQty = toStock.Quantity
		toNewQty = toPreviousQty + transfer.Quantity
	} else {
		toPreviousQty = 0
		toNewQty = transfer.Quantity
	}

	// Transfer is a transaction between warehouses - does not affect product catalog (master data)
	// Product.Stock remains unchanged as it represents available stock in catalog
	if err := w.warehouseStockRepository.Transfer(ctx, transfer); err != nil {
		return err
	}

	// Create stock movement record for source warehouse (negative quantity)
	fromMovement := &domain.StockMovement{
		ProductUUID:     transfer.ProductUUID,
		WarehouseUUID:   transfer.FromWarehouseUUID,
		MovementType:    domain.MovementTypeTransfer,
		Quantity:        -transfer.Quantity, // Negative for out
		PreviousQty:     fromPreviousQty,
		NewQty:          fromNewQty,
		ToWarehouseUUID: transfer.ToWarehouseUUID,
		ReferenceNumber: transfer.UUID,
		Notes:           transfer.Notes,
		MovementDate:    transfer.TransferDate,
	}
	if err := w.stockMovementRepository.Create(ctx, fromMovement); err != nil {
		return err
	}

	// Create stock movement record for destination warehouse (positive quantity)
	toMovement := &domain.StockMovement{
		ProductUUID:     transfer.ProductUUID,
		WarehouseUUID:   transfer.ToWarehouseUUID,
		MovementType:    domain.MovementTypeTransfer,
		Quantity:        transfer.Quantity, // Positive for in
		PreviousQty:     toPreviousQty,
		NewQty:          toNewQty,
		ToWarehouseUUID: transfer.FromWarehouseUUID,
		ReferenceNumber: transfer.UUID,
		Notes:           transfer.Notes,
		MovementDate:    transfer.TransferDate,
	}
	if err := w.stockMovementRepository.Create(ctx, toMovement); err != nil {
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
		if err := w.warehouseStockRepository.CreateOrUpdate(ctx, existing); err != nil {
			return err
		}
	} else {
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
