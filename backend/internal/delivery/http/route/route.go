package route

import (
	"github.com/gorilla/mux"
	"github.com/shirloin/stockhub/internal/delivery/http/handler"
)

type RouteConfig struct {
	Router   *mux.Router
	Handlers *handler.Handler
}

func (c *RouteConfig) Setup(mux *mux.Router) {
	router := mux.PathPrefix("/api").Subrouter()
	c.SetupProductRoutes(router)
	c.SetupCategoryRoutes(router)
	c.SetupSupplierRoutes(router)
	c.SetupWarehouseRoutes(router)
	c.SetupStockMovementRoutes(router)
}

func (c *RouteConfig) SetupProductRoutes(mux *mux.Router) {
	mux.HandleFunc("/products", c.Handlers.ProductHandler.Create).Methods("POST")
	mux.HandleFunc("/products", c.Handlers.ProductHandler.GetAll).Methods("GET")
	mux.HandleFunc("/products/top-by-stock", c.Handlers.ProductHandler.GetTopByStock).Methods("GET")
	mux.HandleFunc("/products/{uuid}", c.Handlers.ProductHandler.GetById).Methods("GET")
	mux.HandleFunc("/products/{uuid}", c.Handlers.ProductHandler.Update).Methods("PUT")
	mux.HandleFunc("/products/{uuid}", c.Handlers.ProductHandler.Delete).Methods("DELETE")
}

func (c *RouteConfig) SetupCategoryRoutes(mux *mux.Router) {
	mux.HandleFunc("/categories", c.Handlers.CategoryHandler.Create).Methods("POST")
	mux.HandleFunc("/categories", c.Handlers.CategoryHandler.GetAll).Methods("GET")
	mux.HandleFunc("/categories/{uuid}", c.Handlers.CategoryHandler.GetById).Methods("GET")
	mux.HandleFunc("/categories/{uuid}", c.Handlers.CategoryHandler.Update).Methods("PUT")
	mux.HandleFunc("/categories/{uuid}", c.Handlers.CategoryHandler.Delete).Methods("DELETE")
}

func (c *RouteConfig) SetupSupplierRoutes(mux *mux.Router) {
	mux.HandleFunc("/suppliers", c.Handlers.SupplierHandler.Create).Methods("POST")
	mux.HandleFunc("/suppliers", c.Handlers.SupplierHandler.GetAll).Methods("GET")
	mux.HandleFunc("/suppliers/{uuid}", c.Handlers.SupplierHandler.GetById).Methods("GET")
	mux.HandleFunc("/suppliers/{uuid}", c.Handlers.SupplierHandler.Update).Methods("PUT")
	mux.HandleFunc("/suppliers/{uuid}", c.Handlers.SupplierHandler.Delete).Methods("DELETE")
}

func (c *RouteConfig) SetupWarehouseRoutes(mux *mux.Router) {
	mux.HandleFunc("/warehouses", c.Handlers.WarehouseHandler.Create).Methods("POST")
	mux.HandleFunc("/warehouses", c.Handlers.WarehouseHandler.GetAll).Methods("GET")
	mux.HandleFunc("/warehouses/{uuid}", c.Handlers.WarehouseHandler.GetById).Methods("GET")
	mux.HandleFunc("/warehouses/{uuid}", c.Handlers.WarehouseHandler.Update).Methods("PUT")
	mux.HandleFunc("/warehouses/{uuid}", c.Handlers.WarehouseHandler.Delete).Methods("DELETE")
	mux.HandleFunc("/warehouses/{uuid}/stock", c.Handlers.WarehouseHandler.GetStock).Methods("GET")
	mux.HandleFunc("/warehouses/stock", c.Handlers.WarehouseHandler.AddStock).Methods("POST")
	mux.HandleFunc("/warehouses/transfer", c.Handlers.WarehouseHandler.TransferStock).Methods("POST")
}

func (c *RouteConfig) SetupStockMovementRoutes(mux *mux.Router) {
	// Stock Movements (audit trail)
	mux.HandleFunc("/stock-movements", c.Handlers.StockMovementHandler.GetAll).Methods("GET")
	mux.HandleFunc("/stock-movements/warehouse/{uuid}", c.Handlers.StockMovementHandler.GetByWarehouse).Methods("GET")
	mux.HandleFunc("/stock-movements/product/{uuid}", c.Handlers.StockMovementHandler.GetByProduct).Methods("GET")
	mux.HandleFunc("/stock-movements/date-range", c.Handlers.StockMovementHandler.GetByDateRange).Methods("GET")
	mux.HandleFunc("/stock-movements/type", c.Handlers.StockMovementHandler.GetByType).Methods("GET")

	// Stock IN (receiving)
	mux.HandleFunc("/stock-in", c.Handlers.StockInHandler.Create).Methods("POST")
	mux.HandleFunc("/stock-in", c.Handlers.StockInHandler.GetAll).Methods("GET")
	mux.HandleFunc("/stock-in/warehouse/{uuid}", c.Handlers.StockInHandler.GetByWarehouse).Methods("GET")

	// Stock OUT (shipments)
	mux.HandleFunc("/stock-out", c.Handlers.StockOutHandler.Create).Methods("POST")
	mux.HandleFunc("/stock-out", c.Handlers.StockOutHandler.GetAll).Methods("GET")
	mux.HandleFunc("/stock-out/warehouse/{uuid}", c.Handlers.StockOutHandler.GetByWarehouse).Methods("GET")

	// Stock Adjustments
	mux.HandleFunc("/stock-adjustments", c.Handlers.StockAdjustmentHandler.Create).Methods("POST")
	mux.HandleFunc("/stock-adjustments", c.Handlers.StockAdjustmentHandler.GetAll).Methods("GET")
	mux.HandleFunc("/stock-adjustments/warehouse/{uuid}", c.Handlers.StockAdjustmentHandler.GetByWarehouse).Methods("GET")
}
