package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/usecase"
	"github.com/shirloin/stockhub/pkg/response"
)

type WarehouseHandler struct {
	warehouseUsecase *usecase.WarehouseUseCase
}

func NewWarehouseHandler(warehouseUsecase *usecase.WarehouseUseCase) *WarehouseHandler {
	return &WarehouseHandler{warehouseUsecase: warehouseUsecase}
}

func (h *WarehouseHandler) Create(w http.ResponseWriter, r *http.Request) {
	var warehouse domain.Warehouse

	if err := json.NewDecoder(r.Body).Decode(&warehouse); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.warehouseUsecase.Create(r.Context(), &warehouse); err != nil {
		if err == domain.ErrWarehouseNameRequired {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create warehouse: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Warehouse created successfully", warehouse)
}

func (h *WarehouseHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	// Check if metrics are requested via query parameter
	includeMetrics := r.URL.Query().Get("metrics") == "true"
	limitStr := r.URL.Query().Get("limit")
	limit := 0 // 0 means no limit
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if includeMetrics {
		warehouses, err := h.warehouseUsecase.GetAllWithMetrics(r.Context(), limit)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "Failed to get warehouses: "+err.Error())
			return
		}
		response.Success(w, http.StatusOK, "Warehouses fetched successfully", warehouses)
	} else {
		warehouses, err := h.warehouseUsecase.GetAll(r.Context())
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "Failed to get warehouses: "+err.Error())
			return
		}
		response.Success(w, http.StatusOK, "Warehouses fetched successfully", warehouses)
	}
}

func (h *WarehouseHandler) GetById(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	warehouse, err := h.warehouseUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Warehouse not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to get warehouse: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Warehouse fetched successfully", warehouse)
}

func (h *WarehouseHandler) Update(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	var warehouse domain.Warehouse
	if err := json.NewDecoder(r.Body).Decode(&warehouse); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}
	if err := h.warehouseUsecase.Update(r.Context(), uuid, &warehouse); err != nil {
		if err == domain.ErrWarehouseNameRequired {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Warehouse not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to update warehouse: "+err.Error())
		return
	}

	updatedWarehouse, err := h.warehouseUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch updated warehouse")
		return
	}

	response.Success(w, http.StatusOK, "Warehouse updated successfully", updatedWarehouse)
}

func (h *WarehouseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	if err := h.warehouseUsecase.Delete(r.Context(), uuid); err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Warehouse not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to delete warehouse: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Warehouse deleted successfully", nil)
}

func (h *WarehouseHandler) GetStock(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	stock, err := h.warehouseUsecase.GetWarehouseStock(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get warehouse stock: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Warehouse stock fetched successfully", stock)
}

func (h *WarehouseHandler) AddStock(w http.ResponseWriter, r *http.Request) {
	var stock domain.WarehouseStock
	if err := json.NewDecoder(r.Body).Decode(&stock); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.warehouseUsecase.AddStock(r.Context(), &stock); err != nil {
		if err == domain.ErrInsufficientStock {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		if err == domain.ErrWarehouseCapacityExceeded {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to add stock: "+err.Error())
		return
	}

	response.Success(w, http.StatusOK, "Stock added successfully", stock)
}

func (h *WarehouseHandler) TransferStock(w http.ResponseWriter, r *http.Request) {
	var transfer domain.StockTransfer

	if err := json.NewDecoder(r.Body).Decode(&transfer); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if transfer.Quantity <= 0 {
		response.Error(w, http.StatusBadRequest, domain.ErrQuantityInvalid.Error())
		return
	}

	if err := h.warehouseUsecase.TransferStock(r.Context(), &transfer); err != nil {
		if err == domain.ErrInsufficientStock {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to transfer stock: "+err.Error())
		return
	}

	response.Success(w, http.StatusOK, "Stock transferred successfully", transfer)
}
