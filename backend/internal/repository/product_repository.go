package repository

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db          *gorm.DB
	subscribers []chan []domain.Product
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	repo := &ProductRepository{db: db, subscribers: make([]chan []domain.Product, 0)}
	go repo.pollForChanges()
	return repo
}

func (r *ProductRepository) Create(ctx context.Context, product *domain.Product) error {
	if err := r.db.WithContext(ctx).Create(product).Error; err != nil {
		return err
	}
	// Trigger immediate notification for new product
	go func() {
		allProducts, err := r.FindAll(context.Background())
		if err == nil {
			r.notifySubscribers(allProducts)
		}
	}()
	return nil
}

func (r *ProductRepository) GetAll(ctx context.Context) ([]domain.Product, error) {
	var products []domain.Product
	if err := r.db.WithContext(ctx).Preload("Category").Preload("Supplier").Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetAllPaginated(ctx context.Context, page, limit int) ([]domain.Product, error) {
	var products []domain.Product
	offset := (page - 1) * limit
	if err := r.db.WithContext(ctx).
		Preload("Category").Preload("Supplier").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetById(ctx context.Context, uuid string) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.WithContext(ctx).Preload("Category").Preload("Supplier").Where("uuid = ?", uuid).First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Update(ctx context.Context, uuid string, product *domain.Product) error {
	if err := r.db.WithContext(ctx).Model(&domain.Product{}).Where("uuid = ?", uuid).Updates(product).Error; err != nil {
		return err
	}
	// Trigger immediate notification for updated product
	go func() {
		allProducts, err := r.FindAll(context.Background())
		if err == nil {
			r.notifySubscribers(allProducts)
		}
	}()
	return nil
}

// UpdateStock updates only the stock field, ensuring zero values are persisted.
func (r *ProductRepository) UpdateStock(ctx context.Context, uuid string, stock int) error {
	if err := r.db.WithContext(ctx).
		Model(&domain.Product{}).
		Where("uuid = ?", uuid).
		Update("stock", stock).Error; err != nil {
		return err
	}
	// Trigger immediate notification for stock update
	go func() {
		allProducts, err := r.FindAll(context.Background())
		if err == nil {
			r.notifySubscribers(allProducts)
		}
	}()
	return nil
}

func (r *ProductRepository) Delete(ctx context.Context, uuid string) error {
	if err := r.db.WithContext(ctx).Where("uuid = ?", uuid).Delete(&domain.Product{}).Error; err != nil {
		return err
	}
	// Trigger immediate notification for deleted product
	go func() {
		allProducts, err := r.FindAll(context.Background())
		if err == nil {
			r.notifySubscribers(allProducts)
		}
	}()
	return nil
}

func (r *ProductRepository) SubscribeToChanges() <-chan []domain.Product {
	ch := make(chan []domain.Product, 10)

	r.subscribers = append(r.subscribers, ch)

	return ch

}

func (r *ProductRepository) pollForChanges() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var lastUpdate time.Time
	for range ticker.C {
		products, err := r.getUpdatedProducts(lastUpdate)
		if err != nil {
			continue
		}

		if len(products) > 0 {
			allProducts, err := r.FindAll(context.Background())
			if err != nil {
				continue
			}
			r.notifySubscribers(allProducts)
			lastUpdate = time.Now()
		}
	}
}

func (r *ProductRepository) getUpdatedProducts(since time.Time) ([]domain.Product, error) {
	ctx := context.Background()
	return r.FindUpdatedSince(ctx, since)

}

func (r *ProductRepository) notifySubscribers(products []domain.Product) {

	for _, ch := range r.subscribers {
		select {
		case ch <- products:
		default:
		}
	}
}

func (r *ProductRepository) FindAll(ctx context.Context) ([]domain.Product, error) {
	var products []domain.Product
	if err := r.db.WithContext(ctx).Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) FindUpdatedSince(ctx context.Context, since time.Time) ([]domain.Product, error) {
	var products []domain.Product
	if err := r.db.WithContext(ctx).
		Where("updated_at > ?", since).
		Order("updated_at DESC").
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetLowStockProducts(ctx context.Context) ([]domain.Product, error) {
	var products []domain.Product
	// Get all products where stock is less than or equal to low_stock_threshold
	// Also handle NULL low_stock_threshold by using COALESCE with default value of 10
	if err := r.db.WithContext(ctx).
		Where("stock <= COALESCE(low_stock_threshold, 10)").
		Order("stock ASC").
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetTopByStock(ctx context.Context, limit int) ([]domain.Product, error) {
	var products []domain.Product
	if err := r.db.WithContext(ctx).
		Preload("Category").Preload("Supplier").
		Order("stock DESC").
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetTopByPrice(ctx context.Context, limit int) ([]domain.Product, error) {
	var products []domain.Product
	if err := r.db.WithContext(ctx).
		Preload("Category").Preload("Supplier").
		Order("price DESC").
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Product{}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *ProductRepository) CountLowStock(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Product{}).
		Where("stock <= COALESCE(low_stock_threshold, 10)").
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *ProductRepository) CountOutOfStock(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Product{}).
		Where("stock = 0").
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *ProductRepository) CountLowStockOnly(ctx context.Context) (int64, error) {
	var count int64
	// Count products that are low stock but not out of stock (stock > 0 AND stock <= threshold)
	if err := r.db.WithContext(ctx).
		Model(&domain.Product{}).
		Where("stock > 0 AND stock <= COALESCE(low_stock_threshold, 10)").
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
