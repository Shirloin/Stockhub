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

type SupplierHandler struct {
	supplierUsecase *usecase.SupplierUseCase
}

func NewSupplierHandler(supplierUsecase *usecase.SupplierUseCase) *SupplierHandler {
	return &SupplierHandler{supplierUsecase: supplierUsecase}
}

func (h *SupplierHandler) Create(w http.ResponseWriter, r *http.Request) {
	var supplier domain.Supplier

	if err := json.NewDecoder(r.Body).Decode(&supplier); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.supplierUsecase.Create(r.Context(), &supplier); err != nil {
		if err == domain.ErrSupplierNameRequired || err == domain.ErrSupplierEmailInvalid {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create supplier: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Supplier created successfully", supplier)
}

func (h *SupplierHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	// Check for pagination parameters
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 10 // Default limit

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	// If pagination is requested
	if pageStr != "" || (limitStr != "" && limit != 10) {
		suppliers, total, err := h.supplierUsecase.GetAllPaginated(r.Context(), page, limit)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "Failed to get suppliers: "+err.Error())
			return
		}
		response.PaginatedSuccess(w, http.StatusOK, "Suppliers fetched successfully", page, limit, total, suppliers)
		return
	}

	// Fallback to non-paginated response
	suppliers, err := h.supplierUsecase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get suppliers: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Suppliers fetched successfully", suppliers)
}

func (h *SupplierHandler) GetById(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	supplier, err := h.supplierUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Supplier not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to get supplier: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Supplier fetched successfully", supplier)
}

func (h *SupplierHandler) Update(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	var supplier domain.Supplier
	if err := json.NewDecoder(r.Body).Decode(&supplier); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}
	if err := h.supplierUsecase.Update(r.Context(), uuid, &supplier); err != nil {
		if err == domain.ErrSupplierNameRequired || err == domain.ErrSupplierEmailInvalid {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Supplier not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to update supplier: "+err.Error())
		return
	}

	updatedSupplier, err := h.supplierUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch updated supplier")
		return
	}

	response.Success(w, http.StatusOK, "Supplier updated successfully", updatedSupplier)
}

func (h *SupplierHandler) Delete(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	if err := h.supplierUsecase.Delete(r.Context(), uuid); err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Supplier not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to delete supplier: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Supplier deleted successfully", nil)
}
