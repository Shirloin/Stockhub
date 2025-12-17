package config

import (
	"net/http"

	"github.com/gorilla/handlers"
)

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

func NewCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}
}

func (c *CORSConfig) SetupCORS(handler http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins(c.AllowedOrigins),
		handlers.AllowedMethods(c.AllowedMethods),
		handlers.AllowedHeaders(c.AllowedHeaders),
	)(handler)
}
