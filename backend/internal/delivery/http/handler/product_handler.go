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

type ProductHandler struct {
	productUsecase *usecase.ProductUseCase
}

func NewProductHandler(productUsecase *usecase.ProductUseCase) *ProductHandler {
	return &ProductHandler{productUsecase: productUsecase}
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var product domain.Product

	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.productUsecase.Create(r.Context(), &product); err != nil {
		if err == domain.ErrProductTitleRequired ||
			err == domain.ErrProductSKURequired ||
			err == domain.ErrProductPriceInvalid ||
			err == domain.ErrProductStockInvalid {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create product: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Product created successfully", product)
}

func (h *ProductHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	products, err := h.productUsecase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get products")
		return
	}
	response.Success(w, http.StatusOK, "Products fetched successfully", products)
}

func (h *ProductHandler) GetById(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	product, err := h.productUsecase.GetById(r.Context(), uuid)
	if err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to get product: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Product fetched successfully", product)
}
func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	var product domain.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}
	if err := h.productUsecase.Update(r.Context(), uuid, &product); err != nil {
		if err == domain.ErrProductTitleRequired ||
			err == domain.ErrProductSKURequired ||
			err == domain.ErrProductPriceInvalid ||
			err == domain.ErrProductStockInvalid {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to update product: "+err.Error())
		return
	}

	// Fetch updated product
	updatedProduct, err := h.productUsecase.GetById(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch updated product")
		return
	}

	response.Success(w, http.StatusOK, "Product updated successfully", updatedProduct)
}
func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	if err := h.productUsecase.Delete(r.Context(), uuid); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to delete product")
		return
	}
	response.Success(w, http.StatusOK, "Product deleted successfully", nil)
}

func (h *ProductHandler) GetTopByStock(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 5 // Default to 5
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	products, err := h.productUsecase.GetTopByStock(r.Context(), limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get top products: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Top products fetched successfully", products)
}
