package usecase

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
)

type ProductUseCase struct {
	productRepository        *repository.ProductRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseRepository      *repository.WarehouseRepository
}

func NewProductUseCase(productRepository *repository.ProductRepository, warehouseStockRepository *repository.WarehouseStockRepository, warehouseRepository *repository.WarehouseRepository) *ProductUseCase {
	return &ProductUseCase{
		productRepository:        productRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseRepository:      warehouseRepository,
	}
}

func (p *ProductUseCase) Create(ctx context.Context, product *domain.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := product.Validate(); err != nil {
		return err
	}

	// Product.Stock is master data - user can set initial stock value
	// It represents the total available stock in the catalog
	if product.Stock < 0 {
		product.Stock = 0
	}

	return p.productRepository.Create(ctx, product)
}

func (p *ProductUseCase) GetAll(ctx context.Context) ([]domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return p.productRepository.GetAll(ctx)
}

func (p *ProductUseCase) GetById(ctx context.Context, uuid string) (*domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return p.productRepository.GetById(ctx, uuid)
}

func (p *ProductUseCase) Update(ctx context.Context, uuid string, product *domain.Product) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Check if product exists
	existing, err := p.productRepository.GetById(ctx, uuid)
	if err != nil {
		return err
	}

	// Preserve UUID and timestamps
	product.UUID = existing.UUID
	product.CreatedAt = existing.CreatedAt

	// Product.Stock is master data - update it directly
	// This represents the total available stock in the catalog
	// Warehouse stocks are transactions that reduce from this master data
	if product.Stock < 0 {
		product.Stock = 0
	}

	if err := product.Validate(); err != nil {
		return err
	}

	return p.productRepository.Update(ctx, uuid, product)
}

func (p *ProductUseCase) Delete(ctx context.Context, uuid string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return p.productRepository.Delete(ctx, uuid)
}

func (p *ProductUseCase) GetTopByStock(ctx context.Context, limit int) ([]domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return p.productRepository.GetTopByStock(ctx, limit)
}

func (p *ProductUseCase) GetTopByPrice(ctx context.Context, limit int) ([]domain.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return p.productRepository.GetTopByPrice(ctx, limit)
}
