package repository

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/gorm"
)

type WarehouseRepository struct {
	db          *gorm.DB
	subscribers []chan []domain.Warehouse
}

func NewWarehouseRepository(db *gorm.DB) *WarehouseRepository {
	repo := &WarehouseRepository{db: db, subscribers: make([]chan []domain.Warehouse, 0)}
	go repo.pollForChanges()
	return repo
}

func (r *WarehouseRepository) Create(ctx context.Context, warehouse *domain.Warehouse) error {
	if err := r.db.WithContext(ctx).Create(warehouse).Error; err != nil {
		return err
	}
	// Trigger immediate notification for new warehouse
	go func() {
		allWarehouses, err := r.GetAll(context.Background())
		if err == nil {
			r.notifySubscribers(allWarehouses)
		}
	}()
	return nil
}

func (r *WarehouseRepository) GetAll(ctx context.Context) ([]domain.Warehouse, error) {
	var warehouses []domain.Warehouse
	if err := r.db.WithContext(ctx).Where("is_active = ?", true).Order("name ASC").Find(&warehouses).Error; err != nil {
		return nil, err
	}
	return warehouses, nil
}

// GetAllPaginated returns paginated warehouses
func (r *WarehouseRepository) GetAllPaginated(ctx context.Context, page, limit int) ([]domain.Warehouse, error) {
	var warehouses []domain.Warehouse
	offset := (page - 1) * limit
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("name ASC").
		Offset(offset).
		Limit(limit).
		Find(&warehouses).Error; err != nil {
		return nil, err
	}
	return warehouses, nil
}

// GetAllWithMetrics returns warehouses with utilization metrics, sorted by utilization descending
func (r *WarehouseRepository) GetAllWithMetrics(ctx context.Context, limit int) ([]domain.WarehouseWithMetrics, error) {
	type Result struct {
		domain.Warehouse
		TotalStock  int     `gorm:"column:total_stock"`
		Utilization float64 `gorm:"column:utilization"`
	}

	var results []Result

	// Build SQL query with utilization calculation and sorting in database
	query := `
		SELECT
			w.*,
			COALESCE(SUM(ws.quantity), 0) as total_stock,
			CASE
				WHEN w.capacity > 0 THEN
					LEAST((COALESCE(SUM(ws.quantity), 0)::float / w.capacity::float) * 100, 100)
				ELSE 0
			END as utilization
		FROM warehouses w
		LEFT JOIN warehouse_stocks ws ON w.uuid = ws.warehouse_uuid
		WHERE w.is_active = ?
		GROUP BY w.uuid
		ORDER BY utilization DESC
	`

	args := []interface{}{true}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}

	if err := r.db.WithContext(ctx).Raw(query, args...).Scan(&results).Error; err != nil {
		return nil, err
	}

	warehousesWithMetrics := make([]domain.WarehouseWithMetrics, 0, len(results))
	for _, result := range results {
		warehousesWithMetrics = append(warehousesWithMetrics, domain.WarehouseWithMetrics{
			Warehouse:   result.Warehouse,
			TotalStock:  result.TotalStock,
			Utilization: result.Utilization,
		})
	}

	return warehousesWithMetrics, nil
}

// GetAllWithMetricsPaginated returns paginated warehouses with utilization metrics
func (r *WarehouseRepository) GetAllWithMetricsPaginated(ctx context.Context, page, limit int) ([]domain.WarehouseWithMetrics, int64, error) {
	type Result struct {
		domain.Warehouse
		TotalStock  int     `gorm:"column:total_stock"`
		Utilization float64 `gorm:"column:utilization"`
	}

	var results []Result
	var total int64

	// Count total warehouses
	countQuery := `
		SELECT COUNT(DISTINCT w.uuid)
		FROM warehouses w
		WHERE w.is_active = ?
	`
	if err := r.db.WithContext(ctx).Raw(countQuery, true).Scan(&total).Error; err != nil {
		return nil, 0, err
	}

	// Build SQL query with utilization calculation and sorting in database
	offset := (page - 1) * limit
	query := `
		SELECT
			w.*,
			COALESCE(SUM(ws.quantity), 0) as total_stock,
			CASE
				WHEN w.capacity > 0 THEN
					LEAST((COALESCE(SUM(ws.quantity), 0)::float / w.capacity::float) * 100, 100)
				ELSE 0
			END as utilization
		FROM warehouses w
		LEFT JOIN warehouse_stocks ws ON w.uuid = ws.warehouse_uuid
		WHERE w.is_active = ?
		GROUP BY w.uuid
		ORDER BY utilization DESC
		LIMIT ? OFFSET ?
	`

	args := []interface{}{true, limit, offset}
	if err := r.db.WithContext(ctx).Raw(query, args...).Scan(&results).Error; err != nil {
		return nil, 0, err
	}

	warehousesWithMetrics := make([]domain.WarehouseWithMetrics, 0, len(results))
	for _, result := range results {
		warehousesWithMetrics = append(warehousesWithMetrics, domain.WarehouseWithMetrics{
			Warehouse:   result.Warehouse,
			TotalStock:  result.TotalStock,
			Utilization: result.Utilization,
		})
	}

	return warehousesWithMetrics, total, nil
}

func (r *WarehouseRepository) GetByID(ctx context.Context, uuid string) (*domain.Warehouse, error) {
	var warehouse domain.Warehouse
	if err := r.db.WithContext(ctx).Where("uuid = ?", uuid).First(&warehouse).Error; err != nil {
		return nil, err
	}
	return &warehouse, nil
}

func (r *WarehouseRepository) Update(ctx context.Context, uuid string, warehouse *domain.Warehouse) error {
	return r.db.WithContext(ctx).Model(&domain.Warehouse{}).Where("uuid = ?", uuid).Updates(warehouse).Error
}

func (r *WarehouseRepository) Delete(ctx context.Context, uuid string) error {
	return r.db.WithContext(ctx).Model(&domain.Warehouse{}).Where("uuid = ?", uuid).Update("is_active", false).Error
}

func (r *WarehouseRepository) SubscribeToChanges() <-chan []domain.Warehouse {
	ch := make(chan []domain.Warehouse, 10)
	r.subscribers = append(r.subscribers, ch)
	return ch
}

func (r *WarehouseRepository) pollForChanges() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var lastUpdate time.Time
	for range ticker.C {
		warehouses, err := r.getUpdatedWarehouses(lastUpdate)
		if err != nil {
			continue
		}

		if len(warehouses) > 0 {
			allWarehouses, err := r.GetAll(context.Background())
			if err != nil {
				continue
			}
			r.notifySubscribers(allWarehouses)
			lastUpdate = time.Now()
		}
	}
}

func (r *WarehouseRepository) getUpdatedWarehouses(since time.Time) ([]domain.Warehouse, error) {
	ctx := context.Background()
	return r.FindUpdatedSince(ctx, since)
}

func (r *WarehouseRepository) notifySubscribers(warehouses []domain.Warehouse) {
	for _, ch := range r.subscribers {
		select {
		case ch <- warehouses:
		default:
		}
	}
}

func (r *WarehouseRepository) FindUpdatedSince(ctx context.Context, since time.Time) ([]domain.Warehouse, error) {
	var warehouses []domain.Warehouse
	if err := r.db.WithContext(ctx).
		Where("updated_at > ?", since).
		Order("updated_at DESC").
		Find(&warehouses).Error; err != nil {
		return nil, err
	}
	return warehouses, nil
}

func (r *WarehouseRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Warehouse{}).
		Where("is_active = ?", true).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

type WarehouseStockRepository struct {
	db *gorm.DB
}

func NewWarehouseStockRepository(db *gorm.DB) *WarehouseStockRepository {
	return &WarehouseStockRepository{db: db}
}

func (r *WarehouseStockRepository) CreateOrUpdate(ctx context.Context, stock *domain.WarehouseStock) error {
	var existing domain.WarehouseStock
	err := r.db.WithContext(ctx).
		Where("product_uuid = ? AND warehouse_uuid = ?", stock.ProductUUID, stock.WarehouseUUID).
		First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return r.db.WithContext(ctx).Create(stock).Error
	} else if err != nil {
		return err
	}

	existing.Quantity = stock.Quantity
	return r.db.WithContext(ctx).Save(&existing).Error
}

func (r *WarehouseStockRepository) GetByProductAndWarehouse(ctx context.Context, productUUID, warehouseUUID string) (*domain.WarehouseStock, error) {
	var stock domain.WarehouseStock
	err := r.db.WithContext(ctx).
		Preload("Product").Preload("Warehouse").
		Where("product_uuid = ? AND warehouse_uuid = ?", productUUID, warehouseUUID).
		First(&stock).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &stock, nil
}

func (r *WarehouseStockRepository) GetByWarehouse(ctx context.Context, warehouseUUID string) ([]domain.WarehouseStock, error) {
	var stocks []domain.WarehouseStock
	if err := r.db.WithContext(ctx).
		Preload("Product").
		Where("warehouse_uuid = ?", warehouseUUID).
		Find(&stocks).Error; err != nil {
		return nil, err
	}
	return stocks, nil
}

func (r *WarehouseStockRepository) GetByProduct(ctx context.Context, productUUID string) ([]domain.WarehouseStock, error) {
	var stocks []domain.WarehouseStock
	if err := r.db.WithContext(ctx).
		Preload("Warehouse").
		Where("product_uuid = ?", productUUID).
		Find(&stocks).Error; err != nil {
		return nil, err
	}
	return stocks, nil
}

func (r *WarehouseStockRepository) GetTotalStockByProduct(ctx context.Context, productUUID string) (int, error) {
	var total int
	if err := r.db.WithContext(ctx).
		Model(&domain.WarehouseStock{}).
		Where("product_uuid = ?", productUUID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}

func (r *WarehouseStockRepository) GetTotalStockByWarehouse(ctx context.Context, warehouseUUID string) (int, error) {
	var total int
	if err := r.db.WithContext(ctx).
		Model(&domain.WarehouseStock{}).
		Where("warehouse_uuid = ?", warehouseUUID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}

func (r *WarehouseStockRepository) Transfer(ctx context.Context, transfer *domain.StockTransfer) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create transfer record
		if err := tx.Create(transfer).Error; err != nil {
			return err
		}

		// Decrease stock from source warehouse
		var fromStock domain.WarehouseStock
		if err := tx.Where("product_uuid = ? AND warehouse_uuid = ?", transfer.ProductUUID, transfer.FromWarehouseUUID).
			First(&fromStock).Error; err != nil {
			return err
		}

		if fromStock.Quantity < transfer.Quantity {
			return domain.ErrInsufficientStock
		}

		fromStock.Quantity -= transfer.Quantity
		if err := tx.Save(&fromStock).Error; err != nil {
			return err
		}

		// Increase stock in destination warehouse
		var toStock domain.WarehouseStock
		err := tx.Where("product_uuid = ? AND warehouse_uuid = ?", transfer.ProductUUID, transfer.ToWarehouseUUID).
			First(&toStock).Error

		if err == gorm.ErrRecordNotFound {
			toStock = domain.WarehouseStock{
				ProductUUID:   transfer.ProductUUID,
				WarehouseUUID: transfer.ToWarehouseUUID,
				Quantity:      transfer.Quantity,
			}
			if err := tx.Create(&toStock).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			toStock.Quantity += transfer.Quantity
			if err := tx.Save(&toStock).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
