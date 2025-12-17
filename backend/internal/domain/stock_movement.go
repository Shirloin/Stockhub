package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StockMovementType represents the type of stock movement
type StockMovementType string

const (
	MovementTypeStockIn     StockMovementType = "STOCK_IN"    // Receiving goods
	MovementTypeStockOut    StockMovementType = "STOCK_OUT"   // Shipments/sales
	MovementTypeTransfer    StockMovementType = "TRANSFER"    // Inter-warehouse transfer
	MovementTypeAdjustment  StockMovementType = "ADJUSTMENT"  // Adjustments (damage, loss, corrections)
	MovementTypeReservation StockMovementType = "RESERVATION" // Reserve stock
	MovementTypeRelease     StockMovementType = "RELEASE"     // Release reserved stock
)

// AdjustmentReason represents the reason for stock adjustment
type AdjustmentReason string

const (
	AdjustmentReasonDamage     AdjustmentReason = "DAMAGE"
	AdjustmentReasonLoss       AdjustmentReason = "LOSS"
	AdjustmentReasonExpired    AdjustmentReason = "EXPIRED"
	AdjustmentReasonCorrection AdjustmentReason = "CORRECTION"
	AdjustmentReasonTheft      AdjustmentReason = "THEFT"
	AdjustmentReasonOther      AdjustmentReason = "OTHER"
)

// StockMovement represents all stock movements (IN, OUT, TRANSFER, ADJUSTMENT)
type StockMovement struct {
	UUID             string            `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID      string            `gorm:"type:uuid;not null;index" json:"productUuid"`
	WarehouseUUID    string            `gorm:"type:uuid;not null;index" json:"warehouseUuid"`
	Product          Product           `gorm:"foreignKey:ProductUUID;references:UUID" json:"product,omitempty"`
	Warehouse        Warehouse         `gorm:"foreignKey:WarehouseUUID;references:UUID" json:"warehouse,omitempty"`
	MovementType     StockMovementType `gorm:"type:varchar(20);not null;index" json:"movementType"`
	Quantity         int               `gorm:"not null" json:"quantity"`                 // Positive for IN, negative for OUT
	PreviousQty      int               `gorm:"not null;default:0" json:"previousQty"`    // Stock before movement
	NewQty           int               `gorm:"not null;default:0" json:"newQty"`         // Stock after movement
	ReferenceNumber  string            `gorm:"size:100;index" json:"referenceNumber"`    // PO number, SO number, etc.
	ToWarehouseUUID  string            `gorm:"type:uuid;index" json:"toWarehouseUuid"`   // For transfers
	AdjustmentReason AdjustmentReason  `gorm:"type:varchar(20)" json:"adjustmentReason"` // For adjustments
	Notes            string            `gorm:"type:text" json:"notes"`
	CreatedBy        string            `gorm:"size:100" json:"createdBy"` // User who created the movement
	MovementDate     time.Time         `gorm:"not null;index" json:"movementDate"`
	CreatedAt        time.Time         `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time         `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (sm *StockMovement) BeforeCreate(tx *gorm.DB) (err error) {
	sm.UUID = uuid.New().String()
	if sm.MovementDate.IsZero() {
		sm.MovementDate = time.Now()
	}
	return
}

// StockIn represents receiving goods (Stock IN)
type StockIn struct {
	UUID            string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID     string    `gorm:"type:uuid;not null;index" json:"productUuid"`
	WarehouseUUID   string    `gorm:"type:uuid;not null;index" json:"warehouseUuid"`
	Product         Product   `gorm:"foreignKey:ProductUUID;references:UUID" json:"product,omitempty"`
	Warehouse       Warehouse `gorm:"foreignKey:WarehouseUUID;references:UUID" json:"warehouse,omitempty"`
	Quantity        int       `gorm:"not null" json:"quantity"`
	PurchaseOrderNo string    `gorm:"size:100;index" json:"purchaseOrderNo"`
	SupplierUUID    string    `gorm:"type:uuid;index" json:"supplierUuid"`
	Supplier        Supplier  `gorm:"foreignKey:SupplierUUID;references:UUID" json:"supplier,omitempty"`
	ReceivedDate    time.Time `gorm:"not null;index" json:"receivedDate"`
	ReceivedBy      string    `gorm:"size:100" json:"receivedBy"`
	Notes           string    `gorm:"type:text" json:"notes"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (si *StockIn) BeforeCreate(tx *gorm.DB) (err error) {
	si.UUID = uuid.New().String()
	if si.ReceivedDate.IsZero() {
		si.ReceivedDate = time.Now()
	}
	return
}

// StockOut represents shipments/sales (Stock OUT)
type StockOut struct {
	UUID          string    `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID   string    `gorm:"type:uuid;not null;index" json:"productUuid"`
	WarehouseUUID string    `gorm:"type:uuid;not null;index" json:"warehouseUuid"`
	Product       Product   `gorm:"foreignKey:ProductUUID;references:UUID" json:"product,omitempty"`
	Warehouse     Warehouse `gorm:"foreignKey:WarehouseUUID;references:UUID" json:"warehouse,omitempty"`
	Quantity      int       `gorm:"not null" json:"quantity"`
	SalesOrderNo  string    `gorm:"size:100;index" json:"salesOrderNo"`
	CustomerName  string    `gorm:"size:100" json:"customerName"`
	ShippedDate   time.Time `gorm:"not null;index" json:"shippedDate"`
	ShippedBy     string    `gorm:"size:100" json:"shippedBy"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (so *StockOut) BeforeCreate(tx *gorm.DB) (err error) {
	so.UUID = uuid.New().String()
	if so.ShippedDate.IsZero() {
		so.ShippedDate = time.Now()
	}
	return
}

// StockAdjustment represents stock adjustments (damage, loss, corrections)
type StockAdjustment struct {
	UUID           string           `gorm:"type:uuid;primaryKey" json:"uuid"`
	ProductUUID    string           `gorm:"type:uuid;not null;index" json:"productUuid"`
	WarehouseUUID  string           `gorm:"type:uuid;not null;index" json:"warehouseUuid"`
	Product        Product          `gorm:"foreignKey:ProductUUID;references:UUID" json:"product,omitempty"`
	Warehouse      Warehouse        `gorm:"foreignKey:WarehouseUUID;references:UUID" json:"warehouse,omitempty"`
	Quantity       int              `gorm:"not null" json:"quantity"` // Positive to add, negative to subtract
	PreviousQty    int              `gorm:"not null;default:0" json:"previousQty"`
	NewQty         int              `gorm:"not null;default:0" json:"newQty"`
	Reason         AdjustmentReason `gorm:"type:varchar(20);not null" json:"reason"`
	AdjustedBy     string           `gorm:"size:100" json:"adjustedBy"`
	AdjustmentDate time.Time        `gorm:"not null;index" json:"adjustmentDate"`
	Notes          string           `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time        `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time        `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (sa *StockAdjustment) BeforeCreate(tx *gorm.DB) (err error) {
	sa.UUID = uuid.New().String()
	if sa.AdjustmentDate.IsZero() {
		sa.AdjustmentDate = time.Now()
	}
	return
}

// StockMovementRepository interface
type StockMovementRepository interface {
	Create(ctx context.Context, movement *StockMovement) error
	GetAll(ctx context.Context) ([]StockMovement, error)
	GetByWarehouse(ctx context.Context, warehouseUUID string, limit int) ([]StockMovement, error)
	GetByProduct(ctx context.Context, productUUID string, limit int) ([]StockMovement, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]StockMovement, error)
	GetByType(ctx context.Context, movementType StockMovementType, limit int) ([]StockMovement, error)
}

// StockInRepository interface
type StockInRepository interface {
	Create(ctx context.Context, stockIn *StockIn) error
	GetAll(ctx context.Context) ([]StockIn, error)
	GetByWarehouse(ctx context.Context, warehouseUUID string) ([]StockIn, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]StockIn, error)
}

// StockOutRepository interface
type StockOutRepository interface {
	Create(ctx context.Context, stockOut *StockOut) error
	GetAll(ctx context.Context) ([]StockOut, error)
	GetByWarehouse(ctx context.Context, warehouseUUID string) ([]StockOut, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]StockOut, error)
}

// StockAdjustmentRepository interface
type StockAdjustmentRepository interface {
	Create(ctx context.Context, adjustment *StockAdjustment) error
	GetAll(ctx context.Context) ([]StockAdjustment, error)
	GetByWarehouse(ctx context.Context, warehouseUUID string) ([]StockAdjustment, error)
	GetByReason(ctx context.Context, reason AdjustmentReason) ([]StockAdjustment, error)
}
