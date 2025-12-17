package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	UUID        string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	Name        string    `gorm:"size:100;not null;uniqueIndex" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	c.UUID = uuid.New().String()
	return
}

type CategoryRepository interface {
	Create(ctx context.Context, category *Category) error
	GetAll(ctx context.Context) ([]Category, error)
	GetByID(ctx context.Context, uuid string) (*Category, error)
	Update(ctx context.Context, uuid string, category *Category) error
	Delete(ctx context.Context, uuid string) error
}

type CategoryUsecase interface {
	Create(ctx context.Context, category *Category) error
	GetAll(ctx context.Context) ([]Category, error)
	GetByID(ctx context.Context, uuid string) (*Category, error)
	Update(ctx context.Context, uuid string, category *Category) error
	Delete(ctx context.Context, uuid string) error
}

