package repository

import (
	"context"

	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *domain.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *CategoryRepository) GetAll(ctx context.Context) ([]domain.Category, error) {
	var categories []domain.Category
	if err := r.db.WithContext(ctx).Order("name ASC").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *CategoryRepository) GetByID(ctx context.Context, uuid string) (*domain.Category, error) {
	var category domain.Category
	if err := r.db.WithContext(ctx).Where("uuid = ?", uuid).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) Update(ctx context.Context, uuid string, category *domain.Category) error {
	return r.db.WithContext(ctx).Model(&domain.Category{}).Where("uuid = ?", uuid).Updates(category).Error
}

func (r *CategoryRepository) Delete(ctx context.Context, uuid string) error {
	return r.db.WithContext(ctx).Where("uuid = ?", uuid).Delete(&domain.Category{}).Error
}
