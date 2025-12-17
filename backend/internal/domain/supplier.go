package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Supplier struct {
	UUID        string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Email       string    `gorm:"size:100;index" json:"email"`
	Phone       string    `gorm:"size:20" json:"phone"`
	Address     string    `gorm:"type:text" json:"address"`
	ContactName string    `gorm:"size:100" json:"contactName"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (s *Supplier) BeforeCreate(tx *gorm.DB) (err error) {
	s.UUID = uuid.New().String()
	return
}

type SupplierRepository interface {
	Create(ctx context.Context, supplier *Supplier) error
	GetAll(ctx context.Context) ([]Supplier, error)
	GetByID(ctx context.Context, uuid string) (*Supplier, error)
	Update(ctx context.Context, uuid string, supplier *Supplier) error
	Delete(ctx context.Context, uuid string) error
}

type SupplierUsecase interface {
	Create(ctx context.Context, supplier *Supplier) error
	GetAll(ctx context.Context) ([]Supplier, error)
	GetByID(ctx context.Context, uuid string) (*Supplier, error)
	Update(ctx context.Context, uuid string, supplier *Supplier) error
	Delete(ctx context.Context, uuid string) error
}

