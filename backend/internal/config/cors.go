package config

import (
	"net/http"
	"strings"

	"github.com/gorilla/handlers"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"
)

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

func NewCORSConfig(cfg *Config) *CORSConfig {
	var allowedOrigins []string
	if cfg.CORSAllowedOrigins == "*" {
		allowedOrigins = []string{"*"}
	} else {
		origins := strings.Split(cfg.CORSAllowedOrigins, ",")
		allowedOrigins = make([]string, 0, len(origins))
		for _, origin := range origins {
			trimmed := strings.TrimSpace(origin)
			if trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
		if len(allowedOrigins) == 0 {
			allowedOrigins = []string{"*"}
		}
	}

	// Use default allowed methods
	allowedMethods := []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}

	// Use default allowed headers
	allowedHeaders := []string{"Content-Type", "Authorization"}

	return &CORSConfig{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: allowedMethods,
		AllowedHeaders: allowedHeaders,
	}
}

func (c *CORSConfig) SetupCORS(handler http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins(c.AllowedOrigins),
		handlers.AllowedMethods(c.AllowedMethods),
		handlers.AllowedHeaders(c.AllowedHeaders),
	)(handler)
}

// SetupGRPCCORS configures CORS for gRPC-Web server
func (c *CORSConfig) SetupGRPCCORS(grpcServer *grpc.Server) *grpcweb.WrappedGrpcServer {
	// Check if all origins are allowed
	allowAllOrigins := false
	for _, origin := range c.AllowedOrigins {
		if origin == "*" {
			allowAllOrigins = true
			break
		}
	}

	// Create origin function
	originFunc := func(origin string) bool {
		if allowAllOrigins {
			return true
		}
		for _, allowedOrigin := range c.AllowedOrigins {
			if origin == allowedOrigin {
				return true
			}
			// Support wildcard subdomain matching (e.g., *.example.com)
			if strings.HasPrefix(allowedOrigin, "*.") {
				domain := strings.TrimPrefix(allowedOrigin, "*.")
				if strings.HasSuffix(origin, domain) {
					return true
				}
			}
		}
		return false
	}

	// Create websocket origin function
	websocketOriginFunc := func(req *http.Request) bool {
		origin := req.Header.Get("Origin")
		if origin == "" {
			return true // Allow requests without Origin header
		}
		return originFunc(origin)
	}

	return grpcweb.WrapServer(
		grpcServer,
		grpcweb.WithOriginFunc(originFunc),
		grpcweb.WithWebsockets(true),
		grpcweb.WithWebsocketOriginFunc(websocketOriginFunc),
	)
}
