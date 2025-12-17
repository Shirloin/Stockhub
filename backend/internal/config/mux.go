package config

import (
	"github.com/gorilla/mux"
)

func NewMux() *mux.Router {
	router := mux.NewRouter()
	return router
}
