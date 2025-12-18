package usecase

import (
	"context"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
)

type SupplierUseCase struct {
	supplierRepository *repository.SupplierRepository
}

func NewSupplierUseCase(supplierRepository *repository.SupplierRepository) *SupplierUseCase {
	return &SupplierUseCase{supplierRepository: supplierRepository}
}

func (s *SupplierUseCase) Create(ctx context.Context, supplier *domain.Supplier) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := supplier.Validate(); err != nil {
		return err
	}

	return s.supplierRepository.Create(ctx, supplier)
}

func (s *SupplierUseCase) GetAll(ctx context.Context) ([]domain.Supplier, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return s.supplierRepository.GetAll(ctx)
}

func (s *SupplierUseCase) GetAllPaginated(ctx context.Context, page, limit int) ([]domain.Supplier, int64, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	suppliers, err := s.supplierRepository.GetAllPaginated(ctx, page, limit)
	if err != nil {
		return nil, 0, err
	}
	total, err := s.supplierRepository.Count(ctx)
	if err != nil {
		return nil, 0, err
	}
	return suppliers, total, nil
}

func (s *SupplierUseCase) GetByID(ctx context.Context, uuid string) (*domain.Supplier, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return s.supplierRepository.GetByID(ctx, uuid)
}

func (s *SupplierUseCase) Update(ctx context.Context, uuid string, supplier *domain.Supplier) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	existing, err := s.supplierRepository.GetByID(ctx, uuid)
	if err != nil {
		return err
	}

	supplier.UUID = existing.UUID
	supplier.CreatedAt = existing.CreatedAt

	if err := supplier.Validate(); err != nil {
		return err
	}

	return s.supplierRepository.Update(ctx, uuid, supplier)
}

func (s *SupplierUseCase) Delete(ctx context.Context, uuid string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return s.supplierRepository.Delete(ctx, uuid)
}
