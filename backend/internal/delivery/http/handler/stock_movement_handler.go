package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/usecase"
	"github.com/shirloin/stockhub/pkg/response"
)

type StockMovementHandler struct {
	stockMovementUseCase *usecase.StockMovementUseCase
}

func NewStockMovementHandler(stockMovementUseCase *usecase.StockMovementUseCase) *StockMovementHandler {
	return &StockMovementHandler{stockMovementUseCase: stockMovementUseCase}
}

func (h *StockMovementHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 0 // 0 means no limit
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	movements, err := h.stockMovementUseCase.GetAll(r.Context(), limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get movements: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Movements fetched successfully", movements)
}

func (h *StockMovementHandler) GetByWarehouse(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	movements, err := h.stockMovementUseCase.GetByWarehouse(r.Context(), uuid, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get movements: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Movements fetched successfully", movements)
}

func (h *StockMovementHandler) GetByProduct(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	movements, err := h.stockMovementUseCase.GetByProduct(r.Context(), uuid, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get movements: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Movements fetched successfully", movements)
}

func (h *StockMovementHandler) GetByDateRange(w http.ResponseWriter, r *http.Request) {
	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid startDate format. Use YYYY-MM-DD")
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid endDate format. Use YYYY-MM-DD")
		return
	}

	movements, err := h.stockMovementUseCase.GetByDateRange(r.Context(), startDate, endDate)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get movements: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Movements fetched successfully", movements)
}

func (h *StockMovementHandler) GetByType(w http.ResponseWriter, r *http.Request) {
	movementType := domain.StockMovementType(r.URL.Query().Get("type"))
	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	movements, err := h.stockMovementUseCase.GetByType(r.Context(), movementType, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get movements: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Movements fetched successfully", movements)
}

type StockInHandler struct {
	stockInUseCase *usecase.StockInUseCase
}

func NewStockInHandler(stockInUseCase *usecase.StockInUseCase) *StockInHandler {
	return &StockInHandler{stockInUseCase: stockInUseCase}
}

func (h *StockInHandler) Create(w http.ResponseWriter, r *http.Request) {
	var stockIn domain.StockIn

	if err := json.NewDecoder(r.Body).Decode(&stockIn); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if stockIn.Quantity <= 0 {
		response.Error(w, http.StatusBadRequest, "Quantity must be greater than 0")
		return
	}

	if err := h.stockInUseCase.Create(r.Context(), &stockIn); err != nil {
		if err == domain.ErrWarehouseCapacityExceeded {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create stock in: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Stock in created successfully", stockIn)
}

func (h *StockInHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	stockIns, err := h.stockInUseCase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get stock ins: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Stock ins fetched successfully", stockIns)
}

func (h *StockInHandler) GetByWarehouse(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	stockIns, err := h.stockInUseCase.GetByWarehouse(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get stock ins: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Stock ins fetched successfully", stockIns)
}

type StockOutHandler struct {
	stockOutUseCase *usecase.StockOutUseCase
}

func NewStockOutHandler(stockOutUseCase *usecase.StockOutUseCase) *StockOutHandler {
	return &StockOutHandler{stockOutUseCase: stockOutUseCase}
}

func (h *StockOutHandler) Create(w http.ResponseWriter, r *http.Request) {
	var stockOut domain.StockOut

	if err := json.NewDecoder(r.Body).Decode(&stockOut); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if stockOut.Quantity <= 0 {
		response.Error(w, http.StatusBadRequest, "Quantity must be greater than 0")
		return
	}

	if err := h.stockOutUseCase.Create(r.Context(), &stockOut); err != nil {
		if err == domain.ErrInsufficientStock {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create stock out: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Stock out created successfully", stockOut)
}

func (h *StockOutHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	stockOuts, err := h.stockOutUseCase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get stock outs: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Stock outs fetched successfully", stockOuts)
}

func (h *StockOutHandler) GetByWarehouse(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	stockOuts, err := h.stockOutUseCase.GetByWarehouse(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get stock outs: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Stock outs fetched successfully", stockOuts)
}

type StockAdjustmentHandler struct {
	adjustmentUseCase *usecase.StockAdjustmentUseCase
}

func NewStockAdjustmentHandler(adjustmentUseCase *usecase.StockAdjustmentUseCase) *StockAdjustmentHandler {
	return &StockAdjustmentHandler{adjustmentUseCase: adjustmentUseCase}
}

func (h *StockAdjustmentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var adjustment domain.StockAdjustment

	if err := json.NewDecoder(r.Body).Decode(&adjustment); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if adjustment.Quantity == 0 {
		response.Error(w, http.StatusBadRequest, "Quantity cannot be 0")
		return
	}

	if err := h.adjustmentUseCase.Create(r.Context(), &adjustment); err != nil {
		if err == domain.ErrWarehouseCapacityExceeded {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create adjustment: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Adjustment created successfully", adjustment)
}

func (h *StockAdjustmentHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	adjustments, err := h.adjustmentUseCase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get adjustments: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Adjustments fetched successfully", adjustments)
}

func (h *StockAdjustmentHandler) GetByWarehouse(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	adjustments, err := h.adjustmentUseCase.GetByWarehouse(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get adjustments: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Adjustments fetched successfully", adjustments)
}
