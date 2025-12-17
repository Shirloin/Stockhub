package repository

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/gorm"
)

type StockMovementRepository struct {
	db          *gorm.DB
	subscribers []chan []domain.StockMovement
}

func NewStockMovementRepository(db *gorm.DB) *StockMovementRepository {
	repo := &StockMovementRepository{db: db, subscribers: make([]chan []domain.StockMovement, 0)}
	go repo.pollForChanges()
	return repo
}

func (r *StockMovementRepository) Create(ctx context.Context, movement *domain.StockMovement) error {
	// Handle empty ToWarehouseUUID - PostgreSQL doesn't accept empty string for UUID
	// Use Omit to exclude it from insert if empty
	if movement.ToWarehouseUUID == "" {
		return r.db.WithContext(ctx).Omit("to_warehouse_uuid").Create(movement).Error
	}
	return r.db.WithContext(ctx).Create(movement).Error
}

func (r *StockMovementRepository) GetAll(ctx context.Context, limit int) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	query := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Order("movement_date DESC, created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

func (r *StockMovementRepository) GetByWarehouse(ctx context.Context, warehouseUUID string, limit int) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	query := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("warehouse_uuid = ?", warehouseUUID).
		Order("movement_date DESC, created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

func (r *StockMovementRepository) GetByProduct(ctx context.Context, productUUID string, limit int) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	query := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("product_uuid = ?", productUUID).
		Order("movement_date DESC, created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

func (r *StockMovementRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("movement_date >= ? AND movement_date <= ?", startDate, endDate).
		Order("movement_date DESC, created_at DESC").
		Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

func (r *StockMovementRepository) SubscribeToChanges() <-chan []domain.StockMovement {
	ch := make(chan []domain.StockMovement, 10)
	r.subscribers = append(r.subscribers, ch)
	return ch
}

func (r *StockMovementRepository) pollForChanges() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var lastUpdate time.Time
	for range ticker.C {
		movements, err := r.getUpdatedMovements(lastUpdate)
		if err != nil {
			continue
		}

		if len(movements) > 0 {
			allMovements, err := r.GetAll(context.Background(), 0)
			if err != nil {
				continue
			}
			r.notifySubscribers(allMovements)
			lastUpdate = time.Now()
		}
	}
}

func (r *StockMovementRepository) getUpdatedMovements(since time.Time) ([]domain.StockMovement, error) {
	ctx := context.Background()
	return r.FindUpdatedSince(ctx, since)
}

func (r *StockMovementRepository) notifySubscribers(movements []domain.StockMovement) {
	for _, ch := range r.subscribers {
		select {
		case ch <- movements:
		default:
		}
	}
}

func (r *StockMovementRepository) FindUpdatedSince(ctx context.Context, since time.Time) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("created_at > ?", since).
		Order("created_at DESC").
		Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

func (r *StockMovementRepository) GetByType(ctx context.Context, movementType domain.StockMovementType, limit int) ([]domain.StockMovement, error) {
	var movements []domain.StockMovement
	query := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("movement_type = ?", movementType).
		Order("movement_date DESC, created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

type StockInRepository struct {
	db *gorm.DB
}

func NewStockInRepository(db *gorm.DB) *StockInRepository {
	return &StockInRepository{db: db}
}

func (r *StockInRepository) Create(ctx context.Context, stockIn *domain.StockIn) error {
	return r.db.WithContext(ctx).Create(stockIn).Error
}

func (r *StockInRepository) GetAll(ctx context.Context) ([]domain.StockIn, error) {
	var stockIns []domain.StockIn
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").Preload("Supplier").
		Order("received_date DESC").
		Find(&stockIns).Error; err != nil {
		return nil, err
	}
	return stockIns, nil
}

func (r *StockInRepository) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockIn, error) {
	var stockIns []domain.StockIn
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").Preload("Supplier").
		Where("warehouse_uuid = ?", warehouseUUID).
		Order("received_date DESC").
		Find(&stockIns).Error; err != nil {
		return nil, err
	}
	return stockIns, nil
}

func (r *StockInRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockIn, error) {
	var stockIns []domain.StockIn
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").Preload("Supplier").
		Where("received_date >= ? AND received_date <= ?", startDate, endDate).
		Order("received_date DESC").
		Find(&stockIns).Error; err != nil {
		return nil, err
	}
	return stockIns, nil
}

type StockOutRepository struct {
	db *gorm.DB
}

func NewStockOutRepository(db *gorm.DB) *StockOutRepository {
	return &StockOutRepository{db: db}
}

func (r *StockOutRepository) Create(ctx context.Context, stockOut *domain.StockOut) error {
	return r.db.WithContext(ctx).Create(stockOut).Error
}

func (r *StockOutRepository) GetAll(ctx context.Context) ([]domain.StockOut, error) {
	var stockOuts []domain.StockOut
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Order("shipped_date DESC").
		Find(&stockOuts).Error; err != nil {
		return nil, err
	}
	return stockOuts, nil
}

func (r *StockOutRepository) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockOut, error) {
	var stockOuts []domain.StockOut
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("warehouse_uuid = ?", warehouseUUID).
		Order("shipped_date DESC").
		Find(&stockOuts).Error; err != nil {
		return nil, err
	}
	return stockOuts, nil
}

func (r *StockOutRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]domain.StockOut, error) {
	var stockOuts []domain.StockOut
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("shipped_date >= ? AND shipped_date <= ?", startDate, endDate).
		Order("shipped_date DESC").
		Find(&stockOuts).Error; err != nil {
		return nil, err
	}
	return stockOuts, nil
}

type StockAdjustmentRepository struct {
	db *gorm.DB
}

func NewStockAdjustmentRepository(db *gorm.DB) *StockAdjustmentRepository {
	return &StockAdjustmentRepository{db: db}
}

func (r *StockAdjustmentRepository) Create(ctx context.Context, adjustment *domain.StockAdjustment) error {
	return r.db.WithContext(ctx).Create(adjustment).Error
}

func (r *StockAdjustmentRepository) GetAll(ctx context.Context) ([]domain.StockAdjustment, error) {
	var adjustments []domain.StockAdjustment
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Order("adjustment_date DESC").
		Find(&adjustments).Error; err != nil {
		return nil, err
	}
	return adjustments, nil
}

func (r *StockAdjustmentRepository) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.StockAdjustment, error) {
	var adjustments []domain.StockAdjustment
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("warehouse_uuid = ?", warehouseUUID).
		Order("adjustment_date DESC").
		Find(&adjustments).Error; err != nil {
		return nil, err
	}
	return adjustments, nil
}

func (r *StockAdjustmentRepository) GetByReason(ctx context.Context, reason domain.AdjustmentReason) ([]domain.StockAdjustment, error) {
	var adjustments []domain.StockAdjustment
	if err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("reason = ?", reason).
		Order("adjustment_date DESC").
		Find(&adjustments).Error; err != nil {
		return nil, err
	}
	return adjustments, nil
}
