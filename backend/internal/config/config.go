package config

import (
	"os"
)

type Config struct {
	DATABASE_URL string
	PORT         string
	GRPC_PORT    string
}

var AppConfig *Config

func Load() *Config {
	if AppConfig == nil {
		AppConfig = &Config{
			DATABASE_URL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/stockhub"),
			PORT:         getEnv("PORT", ":7788"),
			GRPC_PORT:    getEnv("GRPC_PORT", ":50051"),
		}
	}
	return AppConfig
}

func getEnv(key string, def string) string {

	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}
