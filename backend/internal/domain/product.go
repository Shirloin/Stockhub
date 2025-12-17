package domain

import (
	"context"
	"time"

	pb "github.com/shirloin/stockhub/proto/product"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	UUID              string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	Title             string    `gorm:"size:100;not null" json:"title"`
	Description       string    `gorm:"type:text" json:"description"`
	Price             int       `gorm:"not null" json:"price"`
	Stock             int       `gorm:"not null;default:0" json:"stock"`
	LowStockThreshold int       `gorm:"not null;default:10" json:"lowStockThreshold"`
	SKU               string    `gorm:"size:50;uniqueIndex" json:"sku"`
	Barcode           string    `gorm:"size:100;index" json:"barcode"`
	ImageURL          string    `gorm:"type:text" json:"imageUrl"` // Product image URL
	CategoryUUID      string    `gorm:"type:uuid;index" json:"categoryUuid"`
	SupplierUUID      string    `gorm:"type:uuid;index" json:"supplierUuid"`
	Category          Category  `gorm:"foreignKey:CategoryUUID;references:UUID" json:"category,omitempty"`
	Supplier          Supplier  `gorm:"foreignKey:SupplierUUID;references:UUID" json:"supplier,omitempty"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (p *Product) IsLowStock() bool {
	return p.Stock <= p.LowStockThreshold
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	p.UUID = uuid.New().String()
	return
}

func (p *Product) ToProto() *pb.Product {
	return &pb.Product{
		Uuid:              p.UUID,
		Title:             p.Title,
		Description:       p.Description,
		Price:             int32(p.Price),
		Stock:             int32(p.Stock),
		LowStockThreshold: int32(p.LowStockThreshold),
		Sku:               p.SKU,
		Barcode:           p.Barcode,
		UpdatedAt:         p.UpdatedAt.Format(time.RFC3339),
		CreatedAt:         p.CreatedAt.Format(time.RFC3339),
	}
}

type ProductRepository interface {
	Create(ctx context.Context, product *Product) error
	GetAll(ctx context.Context) ([]Product, error)
	GetByID(ctx context.Context, uuid string) (*Product, error)
	Update(ctx context.Context, uuid string, product *Product) error
	Delete(ctx context.Context, uuid string) error
	SubscribeToChanges() <-chan []Product
}

type ProductUsecase interface {
	Create(ctx context.Context, product *Product) error
	GetAll(ctx context.Context) ([]Product, error)
	GetByID(ctx context.Context, uuid string) (*Product, error)
	Update(ctx context.Context, uuid string, product *Product) error
	Delete(ctx context.Context, uuid string) error
}
