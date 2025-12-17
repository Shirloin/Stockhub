package database

import (
	"log"

	"github.com/shirloin/stockhub/internal/config"
	"github.com/shirloin/stockhub/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Instance *gorm.DB
var err error

func GetInstance() (*gorm.DB, error) {
	if Instance == nil {
		config := config.Load()
		url := config.DATABASE_URL
		db, err := gorm.Open(postgres.Open(url), &gorm.Config{})
		if err != nil {
			return nil, err
		}
		Instance = db
	}
	return Instance, err
}

func Migrate() {
	_, err := GetInstance()
	if err != nil {
		log.Fatalf("Error getting database instance: %v", err)
		panic(err)
	}
	Instance.AutoMigrate(
		&domain.Category{},
		&domain.Supplier{},
		&domain.Product{},
		&domain.Warehouse{},
		&domain.WarehouseStock{},
		&domain.StockTransfer{},
		&domain.StockMovement{},
		&domain.StockIn{},
		&domain.StockOut{},
		&domain.StockAdjustment{},
	)
}
