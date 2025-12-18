package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Warehouse struct {
	UUID         string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Address      string    `gorm:"type:text" json:"address"`
	City         string    `gorm:"size:100" json:"city"`
	State        string    `gorm:"size:100" json:"state"`
	Country      string    `gorm:"size:100" json:"country"`
	PostalCode   string    `gorm:"size:20" json:"postalCode"`
	ManagerName  string    `gorm:"size:100" json:"managerName"`
	ManagerEmail string    `gorm:"size:100" json:"managerEmail"`
	ManagerPhone string    `gorm:"size:20" json:"managerPhone"`
	Capacity     int       `gorm:"default:0" json:"capacity"` // Total capacity in units
	IsActive     bool      `gorm:"default:true" json:"isActive"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (w *Warehouse) BeforeCreate(tx *gorm.DB) (err error) {
	w.UUID = uuid.New().String()
	return
}

type WarehouseStock struct {
	UUID          string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID   string    `gorm:"type:uuid;not null;index" json:"productUuid"`
	WarehouseUUID string    `gorm:"type:uuid;not null;index" json:"warehouseUuid"`
	Product       Product   `gorm:"foreignKey:ProductUUID;references:UUID" json:"product,omitempty"`
	Warehouse     Warehouse `gorm:"foreignKey:WarehouseUUID;references:UUID" json:"warehouse,omitempty"`
	Quantity      int       `gorm:"not null;default:0" json:"quantity"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ws *WarehouseStock) BeforeCreate(tx *gorm.DB) (err error) {
	ws.UUID = uuid.New().String()
	return
}

type StockTransfer struct {
	UUID              string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID       string    `gorm:"type:uuid;not null;index" json:"productUuid"`
	FromWarehouseUUID string    `gorm:"type:uuid;not null;index" json:"fromWarehouseUuid"`
	ToWarehouseUUID   string    `gorm:"type:uuid;not null;index" json:"toWarehouseUuid"`
	Quantity          int       `gorm:"not null" json:"quantity"`
	TransferDate      time.Time `gorm:"not null;index" json:"transferDate"`
	Notes             string    `gorm:"type:text" json:"notes"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (st *StockTransfer) BeforeCreate(tx *gorm.DB) (err error) {
	st.UUID = uuid.New().String()
	return
}

type WarehouseRepository interface {
	Create(ctx context.Context, warehouse *Warehouse) error
	GetAll(ctx context.Context) ([]Warehouse, error)
	GetByID(ctx context.Context, uuid string) (*Warehouse, error)
	Update(ctx context.Context, uuid string, warehouse *Warehouse) error
	Delete(ctx context.Context, uuid string) error
}

type WarehouseStockRepository interface {
	CreateOrUpdate(ctx context.Context, stock *WarehouseStock) error
	GetByProductAndWarehouse(ctx context.Context, productUUID, warehouseUUID string) (*WarehouseStock, error)
	GetByWarehouse(ctx context.Context, warehouseUUID string) ([]WarehouseStock, error)
	GetByProduct(ctx context.Context, productUUID string) ([]WarehouseStock, error)
	GetTotalStockByProduct(ctx context.Context, productUUID string) (int, error)
	GetTotalStockByWarehouse(ctx context.Context, warehouseUUID string) (int, error)
	Transfer(ctx context.Context, transfer *StockTransfer) error
}

// WarehouseWithMetrics includes warehouse data with utilization metrics
type WarehouseWithMetrics struct {
	Warehouse
	TotalStock  int     `json:"totalStock"`  // Total stock currently in warehouse
	Utilization float64 `json:"utilization"` // Utilization percentage (0-100)
}

type WarehouseUsecase interface {
	Create(ctx context.Context, warehouse *Warehouse) error
	GetAll(ctx context.Context) ([]Warehouse, error)
	GetAllWithMetrics(ctx context.Context) ([]WarehouseWithMetrics, error)
	GetByID(ctx context.Context, uuid string) (*Warehouse, error)
	Update(ctx context.Context, uuid string, warehouse *Warehouse) error
	Delete(ctx context.Context, uuid string) error
	TransferStock(ctx context.Context, transfer *StockTransfer) error
	GetWarehouseStock(ctx context.Context, warehouseUUID string) ([]WarehouseStock, error)
}
