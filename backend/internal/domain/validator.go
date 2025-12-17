package domain

import (
	"errors"
	"strings"
)

var (
	ErrProductTitleRequired   = errors.New("product title is required")
	ErrProductTitleTooLong    = errors.New("product title must be less than 100 characters")
	ErrProductPriceInvalid    = errors.New("product price must be greater than 0")
	ErrProductStockInvalid    = errors.New("product stock cannot be negative")
	ErrProductLowStockThresholdInvalid = errors.New("product low stock threshold cannot be negative")
	ErrProductSKURequired     = errors.New("product SKU is required")
	ErrProductSKUTooLong     = errors.New("product SKU must be less than 50 characters")
	ErrProductBarcodeTooLong  = errors.New("product barcode must be less than 100 characters")

	ErrCategoryNameRequired   = errors.New("category name is required")
	ErrCategoryNameTooLong    = errors.New("category name must be less than 100 characters")

	ErrSupplierNameRequired   = errors.New("supplier name is required")
	ErrSupplierNameTooLong    = errors.New("supplier name must be less than 100 characters")
	ErrSupplierEmailInvalid   = errors.New("supplier email is invalid")

	ErrInsufficientStock      = errors.New("insufficient stock available")
	ErrQuantityInvalid        = errors.New("quantity must be greater than 0")

	ErrWarehouseNameRequired  = errors.New("warehouse name is required")
	ErrWarehouseCapacityExceeded = errors.New("warehouse capacity exceeded")
)

func (p *Product) Validate() error {
	if strings.TrimSpace(p.Title) == "" {
		return ErrProductTitleRequired
	}
	if len(p.Title) > 100 {
		return ErrProductTitleTooLong
	}
	if p.Price < 0 {
		return ErrProductPriceInvalid
	}
	if p.Stock < 0 {
		return ErrProductStockInvalid
	}
	if p.LowStockThreshold < 0 {
		return ErrProductLowStockThresholdInvalid
	}
	if strings.TrimSpace(p.SKU) == "" {
		return ErrProductSKURequired
	}
	if len(p.SKU) > 50 {
		return ErrProductSKUTooLong
	}
	if len(p.Barcode) > 100 {
		return ErrProductBarcodeTooLong
	}
	return nil
}

func (c *Category) Validate() error {
	if strings.TrimSpace(c.Name) == "" {
		return ErrCategoryNameRequired
	}
	if len(c.Name) > 100 {
		return ErrCategoryNameTooLong
	}
	return nil
}

func (s *Supplier) Validate() error {
	if strings.TrimSpace(s.Name) == "" {
		return ErrSupplierNameRequired
	}
	if len(s.Name) > 100 {
		return ErrSupplierNameTooLong
	}
	if s.Email != "" && !strings.Contains(s.Email, "@") {
		return ErrSupplierEmailInvalid
	}
	return nil
}

