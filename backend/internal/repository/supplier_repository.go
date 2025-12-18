package repository

import (
	"context"

	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/gorm"
)

type SupplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) *SupplierRepository {
	return &SupplierRepository{db: db}
}

func (r *SupplierRepository) Create(ctx context.Context, supplier *domain.Supplier) error {
	return r.db.WithContext(ctx).Create(supplier).Error
}

func (r *SupplierRepository) GetAll(ctx context.Context) ([]domain.Supplier, error) {
	var suppliers []domain.Supplier
	if err := r.db.WithContext(ctx).Order("name ASC").Find(&suppliers).Error; err != nil {
		return nil, err
	}
	return suppliers, nil
}

func (r *SupplierRepository) GetAllPaginated(ctx context.Context, page, limit int) ([]domain.Supplier, error) {
	var suppliers []domain.Supplier
	offset := (page - 1) * limit
	if err := r.db.WithContext(ctx).
		Order("name ASC").
		Offset(offset).
		Limit(limit).
		Find(&suppliers).Error; err != nil {
		return nil, err
	}
	return suppliers, nil
}

func (r *SupplierRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Supplier{}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *SupplierRepository) GetByID(ctx context.Context, uuid string) (*domain.Supplier, error) {
	var supplier domain.Supplier
	if err := r.db.WithContext(ctx).Where("uuid = ?", uuid).First(&supplier).Error; err != nil {
		return nil, err
	}
	return &supplier, nil
}

func (r *SupplierRepository) Update(ctx context.Context, uuid string, supplier *domain.Supplier) error {
	return r.db.WithContext(ctx).Model(&domain.Supplier{}).Where("uuid = ?", uuid).Updates(supplier).Error
}

func (r *SupplierRepository) Delete(ctx context.Context, uuid string) error {
	return r.db.WithContext(ctx).Where("uuid = ?", uuid).Delete(&domain.Supplier{}).Error
}
