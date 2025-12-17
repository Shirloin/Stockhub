package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/usecase"
	"github.com/shirloin/stockhub/pkg/response"
)

type CategoryHandler struct {
	categoryUsecase *usecase.CategoryUseCase
}

func NewCategoryHandler(categoryUsecase *usecase.CategoryUseCase) *CategoryHandler {
	return &CategoryHandler{categoryUsecase: categoryUsecase}
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var category domain.Category

	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.categoryUsecase.Create(r.Context(), &category); err != nil {
		if err == domain.ErrCategoryNameRequired {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to create category: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "Category created successfully", category)
}

func (h *CategoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	categories, err := h.categoryUsecase.GetAll(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to get categories: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Categories fetched successfully", categories)
}

func (h *CategoryHandler) GetById(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	category, err := h.categoryUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to get category: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Category fetched successfully", category)
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	var category domain.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}
	if err := h.categoryUsecase.Update(r.Context(), uuid, &category); err != nil {
		if err == domain.ErrCategoryNameRequired {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to update category: "+err.Error())
		return
	}

	updatedCategory, err := h.categoryUsecase.GetByID(r.Context(), uuid)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch updated category")
		return
	}

	response.Success(w, http.StatusOK, "Category updated successfully", updatedCategory)
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	if err := h.categoryUsecase.Delete(r.Context(), uuid); err != nil {
		if err.Error() == "record not found" {
			response.Error(w, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Failed to delete category: "+err.Error())
		return
	}
	response.Success(w, http.StatusOK, "Category deleted successfully", nil)
}
