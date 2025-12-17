package usecase

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
)

type CategoryUseCase struct {
	categoryRepository *repository.CategoryRepository
}

func NewCategoryUseCase(categoryRepository *repository.CategoryRepository) *CategoryUseCase {
	return &CategoryUseCase{categoryRepository: categoryRepository}
}

func (c *CategoryUseCase) Create(ctx context.Context, category *domain.Category) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := category.Validate(); err != nil {
		return err
	}

	return c.categoryRepository.Create(ctx, category)
}

func (c *CategoryUseCase) GetAll(ctx context.Context) ([]domain.Category, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return c.categoryRepository.GetAll(ctx)
}

func (c *CategoryUseCase) GetByID(ctx context.Context, uuid string) (*domain.Category, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return c.categoryRepository.GetByID(ctx, uuid)
}

func (c *CategoryUseCase) Update(ctx context.Context, uuid string, category *domain.Category) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	existing, err := c.categoryRepository.GetByID(ctx, uuid)
	if err != nil {
		return err
	}

	category.UUID = existing.UUID
	category.CreatedAt = existing.CreatedAt

	if err := category.Validate(); err != nil {
		return err
	}

	return c.categoryRepository.Update(ctx, uuid, category)
}

func (c *CategoryUseCase) Delete(ctx context.Context, uuid string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return c.categoryRepository.Delete(ctx, uuid)
}
