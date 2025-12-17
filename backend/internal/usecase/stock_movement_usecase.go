package usecase

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
)

type StockMovementUseCase struct {
	stockMovementRepository  *repository.StockMovementRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseRepository      *repository.WarehouseRepository
	productRepository        *repository.ProductRepository
}

func NewStockMovementUseCase(
	stockMovementRepository *repository.StockMovementRepository,
	warehouseStockRepository *repository.WarehouseStockRepository,
	warehouseRepository *repository.WarehouseRepository,
	productRepository *repository.ProductRepository,
) *StockMovementUseCase {
	return &StockMovementUseCase{
		stockMovementRepository:  stockMovementRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseRepository:      warehouseRepository,
		productRepository:        productRepository,
	}
}

// CreateMovement creates a stock movement and updates warehouse stock
func (s *StockMovementUseCase) CreateMovement(ctx context.Context, movement *domain.StockMovement) error {
	// If movement is positive (receiving stock), check warehouse capacity
	if movement.Quantity > 0 {
		// Get warehouse to check capacity
		warehouse, err := s.warehouseRepository.GetByID(ctx, movement.WarehouseUUID)
		if err != nil {
			return err
		}

		// Get current total stock in warehouse (capacity usage)
		currentTotalStock, err := s.warehouseStockRepository.GetTotalStockByWarehouse(ctx, movement.WarehouseUUID)
		if err != nil {
			return err
		}

		// Check warehouse capacity if it's set (> 0)
		if warehouse.Capacity > 0 {
			newTotalStock := currentTotalStock + movement.Quantity
			if newTotalStock > warehouse.Capacity {
				return domain.ErrWarehouseCapacityExceeded
			}
		}
	}

	// Get current warehouse stock
	warehouseStock, err := s.warehouseStockRepository.GetByProductAndWarehouse(ctx, movement.ProductUUID, movement.WarehouseUUID)
	if err != nil {
		return err
	}

	var previousQty int
	if warehouseStock != nil {
		previousQty = warehouseStock.Quantity
	} else {
		previousQty = 0
	}

	// Calculate new quantity
	newQty := previousQty + movement.Quantity
	if newQty < 0 {
		return domain.ErrInsufficientStock
	}

	movement.PreviousQty = previousQty
	movement.NewQty = newQty

	// Create movement record
	if err := s.stockMovementRepository.Create(ctx, movement); err != nil {
		return err
	}

	// Update warehouse stock
	if warehouseStock == nil {
		warehouseStock = &domain.WarehouseStock{
			ProductUUID:   movement.ProductUUID,
			WarehouseUUID: movement.WarehouseUUID,
			Quantity:      newQty,
			ReservedQty:   0,
			AvailableQty:  newQty,
		}
	} else {
		warehouseStock.Quantity = newQty
		warehouseStock.AvailableQty = warehouseStock.Quantity - warehouseStock.ReservedQty
	}

	if err := s.warehouseStockRepository.CreateOrUpdate(ctx, warehouseStock); err != nil {
		return err
	}

	// Update warehouse's updated_at timestamp to trigger real-time updates
	// This ensures warehouse utilization changes are detected by the subscription
	warehouse, err := s.warehouseRepository.GetByID(ctx, movement.WarehouseUUID)
	if err != nil {
		return err
	}
	warehouse.UpdatedAt = time.Now()
	if err := s.warehouseRepository.Update(ctx, movement.WarehouseUUID, warehouse); err != nil {
		return err
	}

	return nil
}

func (s *StockMovementUseCase) GetAll(ctx context.Context, limit int) ([]domain.StockMovement, error) {
	return s.stockMovementRepository.GetAll(ctx, limit)
}

func (s *StockMovementUseCase) GetByWarehouse(ctx context.Context, warehouseUUID string, limit int) ([]domain.StockMovement, error) {
	return s.stockMovementRepository.GetByWarehouse(ctx, warehouseUUID, limit)
}

func (s *StockMovementUseCase) GetByProduct(ctx context.Context, productUUID string, limit int) ([]domain.StockMovement, error) {
	return s.stockMovementRepository.GetByProduct(ctx, productUUID, limit)
}

func (s *StockMovementUseCase) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockMovement, error) {
	return s.stockMovementRepository.GetByDateRange(ctx, startDate, endDate)
}

func (s *StockMovementUseCase) GetByType(ctx context.Context, movementType domain.StockMovementType, limit int) ([]domain.StockMovement, error) {
	return s.stockMovementRepository.GetByType(ctx, movementType, limit)
}

type StockInUseCase struct {
	stockInRepository        *repository.StockInRepository
	stockMovementRepository  *repository.StockMovementRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseRepository      *repository.WarehouseRepository
	productRepository        *repository.ProductRepository
}

func NewStockInUseCase(
	stockInRepository *repository.StockInRepository,
	stockMovementRepository *repository.StockMovementRepository,
	warehouseStockRepository *repository.WarehouseStockRepository,
	warehouseRepository *repository.WarehouseRepository,
	productRepository *repository.ProductRepository,
) *StockInUseCase {
	return &StockInUseCase{
		stockInRepository:        stockInRepository,
		stockMovementRepository:  stockMovementRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseRepository:      warehouseRepository,
		productRepository:        productRepository,
	}
}

func (s *StockInUseCase) Create(ctx context.Context, stockIn *domain.StockIn) error {
	// Get warehouse to check capacity
	warehouse, err := s.warehouseRepository.GetByID(ctx, stockIn.WarehouseUUID)
	if err != nil {
		return err
	}

	// Get current total stock in warehouse (capacity usage)
	currentTotalStock, err := s.warehouseStockRepository.GetTotalStockByWarehouse(ctx, stockIn.WarehouseUUID)
	if err != nil {
		return err
	}

	// Check warehouse capacity if it's set (> 0)
	if warehouse.Capacity > 0 {
		newTotalStock := currentTotalStock + stockIn.Quantity
		if newTotalStock > warehouse.Capacity {
			return domain.ErrWarehouseCapacityExceeded
		}
	}

	// Create stock in record
	if err := s.stockInRepository.Create(ctx, stockIn); err != nil {
		return err
	}

	// Get current warehouse stock
	warehouseStock, err := s.warehouseStockRepository.GetByProductAndWarehouse(ctx, stockIn.ProductUUID, stockIn.WarehouseUUID)
	if err != nil {
		return err
	}

	var previousQty int
	if warehouseStock != nil {
		previousQty = warehouseStock.Quantity
	} else {
		previousQty = 0
	}

	newQty := previousQty + stockIn.Quantity

	// Update warehouse stock
	if warehouseStock == nil {
		warehouseStock = &domain.WarehouseStock{
			ProductUUID:   stockIn.ProductUUID,
			WarehouseUUID: stockIn.WarehouseUUID,
			Quantity:      newQty,
			ReservedQty:   0,
			AvailableQty:  newQty,
		}
	} else {
		warehouseStock.Quantity = newQty
		warehouseStock.AvailableQty = warehouseStock.Quantity - warehouseStock.ReservedQty
	}

	if err := s.warehouseStockRepository.CreateOrUpdate(ctx, warehouseStock); err != nil {
		return err
	}

	// Update warehouse's updated_at timestamp to trigger real-time updates
	warehouse.UpdatedAt = time.Now()
	if err := s.warehouseRepository.Update(ctx, stockIn.WarehouseUUID, warehouse); err != nil {
		return err
	}

	// Create movement record
	movement := &domain.StockMovement{
		ProductUUID:     stockIn.ProductUUID,
		WarehouseUUID:   stockIn.WarehouseUUID,
		MovementType:    domain.MovementTypeStockIn,
		Quantity:        stockIn.Quantity,
		PreviousQty:     previousQty,
		NewQty:          newQty,
		ReferenceNumber: stockIn.PurchaseOrderNo,
		Notes:           stockIn.Notes,
		CreatedBy:       stockIn.ReceivedBy,
		MovementDate:    stockIn.ReceivedDate,
	}
	if err := s.stockMovementRepository.Create(ctx, movement); err != nil {
		return err
	}

	return nil
}

func (s *StockInUseCase) GetAll(ctx context.Context) ([]domain.StockIn, error) {
	return s.stockInRepository.GetAll(ctx)
}

func (s *StockInUseCase) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockIn, error) {
	return s.stockInRepository.GetByWarehouse(ctx, warehouseUUID)
}

func (s *StockInUseCase) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockIn, error) {
	return s.stockInRepository.GetByDateRange(ctx, startDate, endDate)
}

type StockOutUseCase struct {
	stockOutRepository       *repository.StockOutRepository
	stockMovementRepository  *repository.StockMovementRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseRepository      *repository.WarehouseRepository
	productRepository        *repository.ProductRepository
}

func NewStockOutUseCase(
	stockOutRepository *repository.StockOutRepository,
	stockMovementRepository *repository.StockMovementRepository,
	warehouseStockRepository *repository.WarehouseStockRepository,
	warehouseRepository *repository.WarehouseRepository,
	productRepository *repository.ProductRepository,
) *StockOutUseCase {
	return &StockOutUseCase{
		stockOutRepository:       stockOutRepository,
		stockMovementRepository:  stockMovementRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseRepository:      warehouseRepository,
		productRepository:        productRepository,
	}
}

func (s *StockOutUseCase) Create(ctx context.Context, stockOut *domain.StockOut) error {
	// Verify warehouse stock exists and has enough quantity
	warehouseStock, err := s.warehouseStockRepository.GetByProductAndWarehouse(ctx, stockOut.ProductUUID, stockOut.WarehouseUUID)
	if err != nil {
		return err
	}
	if warehouseStock == nil {
		return domain.ErrInsufficientStock
	}

	availableQty := warehouseStock.Quantity - warehouseStock.ReservedQty
	if availableQty < stockOut.Quantity {
		return domain.ErrInsufficientStock
	}

	previousQty := warehouseStock.Quantity
	newQty := previousQty - stockOut.Quantity

	// Create stock out record
	if err := s.stockOutRepository.Create(ctx, stockOut); err != nil {
		return err
	}

	// Update warehouse stock
	warehouseStock.Quantity = newQty
	warehouseStock.AvailableQty = warehouseStock.Quantity - warehouseStock.ReservedQty
	if err := s.warehouseStockRepository.CreateOrUpdate(ctx, warehouseStock); err != nil {
		return err
	}

	// Update warehouse's updated_at timestamp to trigger real-time updates
	warehouse, err := s.warehouseRepository.GetByID(ctx, stockOut.WarehouseUUID)
	if err != nil {
		return err
	}
	warehouse.UpdatedAt = time.Now()
	if err := s.warehouseRepository.Update(ctx, stockOut.WarehouseUUID, warehouse); err != nil {
		return err
	}

	// Create movement record
	movement := &domain.StockMovement{
		ProductUUID:     stockOut.ProductUUID,
		WarehouseUUID:   stockOut.WarehouseUUID,
		MovementType:    domain.MovementTypeStockOut,
		Quantity:        -stockOut.Quantity, // Negative for out
		PreviousQty:     previousQty,
		NewQty:          newQty,
		ReferenceNumber: stockOut.SalesOrderNo,
		Notes:           stockOut.Notes,
		CreatedBy:       stockOut.ShippedBy,
		MovementDate:    stockOut.ShippedDate,
	}
	if err := s.stockMovementRepository.Create(ctx, movement); err != nil {
		return err
	}

	return nil
}

func (s *StockOutUseCase) GetAll(ctx context.Context) ([]domain.StockOut, error) {
	return s.stockOutRepository.GetAll(ctx)
}

func (s *StockOutUseCase) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockOut, error) {
	return s.stockOutRepository.GetByWarehouse(ctx, warehouseUUID)
}

func (s *StockOutUseCase) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockOut, error) {
	return s.stockOutRepository.GetByDateRange(ctx, startDate, endDate)
}

type StockAdjustmentUseCase struct {
	adjustmentRepository     *repository.StockAdjustmentRepository
	stockMovementRepository  *repository.StockMovementRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseRepository      *repository.WarehouseRepository
	productRepository        *repository.ProductRepository
}

func NewStockAdjustmentUseCase(
	adjustmentRepository *repository.StockAdjustmentRepository,
	stockMovementRepository *repository.StockMovementRepository,
	warehouseStockRepository *repository.WarehouseStockRepository,
	warehouseRepository *repository.WarehouseRepository,
	productRepository *repository.ProductRepository,
) *StockAdjustmentUseCase {
	return &StockAdjustmentUseCase{
		adjustmentRepository:     adjustmentRepository,
		stockMovementRepository:  stockMovementRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseRepository:      warehouseRepository,
		productRepository:        productRepository,
	}
}

func (s *StockAdjustmentUseCase) Create(ctx context.Context, adjustment *domain.StockAdjustment) error {
	// If adjustment is positive (adding stock), check warehouse capacity
	if adjustment.Quantity > 0 {
		// Get warehouse to check capacity
		warehouse, err := s.warehouseRepository.GetByID(ctx, adjustment.WarehouseUUID)
		if err != nil {
			return err
		}

		// Get current total stock in warehouse (capacity usage)
		currentTotalStock, err := s.warehouseStockRepository.GetTotalStockByWarehouse(ctx, adjustment.WarehouseUUID)
		if err != nil {
			return err
		}

		// Check warehouse capacity if it's set (> 0)
		if warehouse.Capacity > 0 {
			newTotalStock := currentTotalStock + adjustment.Quantity
			if newTotalStock > warehouse.Capacity {
				return domain.ErrWarehouseCapacityExceeded
			}
		}
	}

	// Get current warehouse stock
	warehouseStock, err := s.warehouseStockRepository.GetByProductAndWarehouse(ctx, adjustment.ProductUUID, adjustment.WarehouseUUID)
	if err != nil {
		return err
	}

	var previousQty int
	if warehouseStock != nil {
		previousQty = warehouseStock.Quantity
	} else {
		previousQty = 0
	}

	newQty := previousQty + adjustment.Quantity
	if newQty < 0 {
		newQty = 0
	}

	adjustment.PreviousQty = previousQty
	adjustment.NewQty = newQty

	// Create adjustment record
	if err := s.adjustmentRepository.Create(ctx, adjustment); err != nil {
		return err
	}

	// Update warehouse stock
	if warehouseStock == nil {
		warehouseStock = &domain.WarehouseStock{
			ProductUUID:   adjustment.ProductUUID,
			WarehouseUUID: adjustment.WarehouseUUID,
			Quantity:      newQty,
			ReservedQty:   0,
			AvailableQty:  newQty,
		}
	} else {
		warehouseStock.Quantity = newQty
		warehouseStock.AvailableQty = warehouseStock.Quantity - warehouseStock.ReservedQty
	}

	if err := s.warehouseStockRepository.CreateOrUpdate(ctx, warehouseStock); err != nil {
		return err
	}

	// Update warehouse's updated_at timestamp to trigger real-time updates
	warehouse, err := s.warehouseRepository.GetByID(ctx, adjustment.WarehouseUUID)
	if err != nil {
		return err
	}
	warehouse.UpdatedAt = time.Now()
	if err := s.warehouseRepository.Update(ctx, adjustment.WarehouseUUID, warehouse); err != nil {
		return err
	}

	// Create movement record
	movement := &domain.StockMovement{
		ProductUUID:      adjustment.ProductUUID,
		WarehouseUUID:    adjustment.WarehouseUUID,
		MovementType:     domain.MovementTypeAdjustment,
		Quantity:         adjustment.Quantity,
		PreviousQty:      previousQty,
		NewQty:           newQty,
		AdjustmentReason: adjustment.Reason,
		Notes:            adjustment.Notes,
		CreatedBy:        adjustment.AdjustedBy,
		MovementDate:     adjustment.AdjustmentDate,
	}
	if err := s.stockMovementRepository.Create(ctx, movement); err != nil {
		return err
	}

	return nil
}

func (s *StockAdjustmentUseCase) GetAll(ctx context.Context) ([]domain.StockAdjustment, error) {
	return s.adjustmentRepository.GetAll(ctx)
}

func (s *StockAdjustmentUseCase) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockAdjustment, error) {
	return s.adjustmentRepository.GetByWarehouse(ctx, warehouseUUID)
}

func (s *StockAdjustmentUseCase) GetByReason(ctx context.Context, reason domain.AdjustmentReason) ([]domain.StockAdjustment, error) {
	return s.adjustmentRepository.GetByReason(ctx, reason)
}
