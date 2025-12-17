package config

import "google.golang.org/grpc"

func NewGRPCServer() *grpc.Server {
	return grpc.NewServer(
		grpc.MaxConcurrentStreams(500),
	)
}
