package handler

import (
	"context"
	"log"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
	"github.com/shirloin/stockhub/internal/usecase"
	pb "github.com/shirloin/stockhub/proto/warehouse"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type WarehouseGRPCHandler struct {
	pb.UnimplementedWarehouseServiceServer
	warehouseRepository      *repository.WarehouseRepository
	warehouseStockRepository *repository.WarehouseStockRepository
	warehouseUseCase         *usecase.WarehouseUseCase
}

func NewWarehouseGRPCHandler(
	warehouseRepository *repository.WarehouseRepository,
	warehouseStockRepository *repository.WarehouseStockRepository,
	warehouseUseCase *usecase.WarehouseUseCase,
) *WarehouseGRPCHandler {
	return &WarehouseGRPCHandler{
		warehouseRepository:      warehouseRepository,
		warehouseStockRepository: warehouseStockRepository,
		warehouseUseCase:         warehouseUseCase,
	}
}

func (h *WarehouseGRPCHandler) WatchWarehouses(req *pb.WatchWarehousesRequest, stream pb.WarehouseService_WatchWarehousesServer) error {
	updates := h.warehouseRepository.SubscribeToChanges()

	ctx := context.Background()

	// Get initial warehouses with metrics if requested
	var initialWarehouses []*pb.WarehouseWithMetrics
	if req.IncludeMetrics {
		warehouses, err := h.warehouseUseCase.GetAllWithMetrics(ctx, int(req.Limit))
		if err != nil {
			return status.Errorf(codes.Internal, "Failed to get initial warehouses: %v", err)
		}
		initialWarehouses = make([]*pb.WarehouseWithMetrics, len(warehouses))
		for i, w := range warehouses {
			proto := h.warehouseToProtoWithMetrics(w)
			initialWarehouses[i] = &proto
		}
	} else {
		// Get all warehouses without metrics (for counting)
		warehouses, err := h.warehouseRepository.GetAll(ctx)
		if err != nil {
			return status.Errorf(codes.Internal, "Failed to get initial warehouses: %v", err)
		}
		initialWarehouses = make([]*pb.WarehouseWithMetrics, len(warehouses))
		for i, w := range warehouses {
			// Calculate metrics on the fly for proto conversion
			totalStock, _ := h.warehouseStockRepository.GetTotalStockByWarehouse(ctx, w.UUID)
			var utilization float64
			if w.Capacity > 0 {
				utilization = (float64(totalStock) / float64(w.Capacity)) * 100
				if utilization > 100 {
					utilization = 100
				}
			}
			proto := &pb.WarehouseWithMetrics{
				Warehouse:   h.warehouseToProto(&w),
				TotalStock:  int32(totalStock),
				Utilization: utilization,
			}
			initialWarehouses[i] = proto
		}
	}

	// Send initial state
	if err := stream.Send(&pb.WarehouseUpdate{
		Warehouses: initialWarehouses,
		Timestamp:  time.Now().Format(time.RFC3339),
	}); err != nil {
		return status.Errorf(codes.Internal, "Failed to send initial warehouses: %v", err)
	}

	// Stream updates
	for {
		select {
		case <-stream.Context().Done():
			log.Println("Warehouse client disconnected")
			return nil
		case warehouses := <-updates:
			// If metrics are requested, get warehouses with metrics sorted by utilization
			var protoWarehouses []*pb.WarehouseWithMetrics
			if req.IncludeMetrics {
				warehousesWithMetrics, err := h.warehouseUseCase.GetAllWithMetrics(ctx, int(req.Limit))
				if err != nil {
					log.Printf("Failed to get warehouses with metrics: %v", err)
					continue
				}
				protoWarehouses = make([]*pb.WarehouseWithMetrics, len(warehousesWithMetrics))
				for i, w := range warehousesWithMetrics {
					proto := h.warehouseToProtoWithMetrics(w)
					protoWarehouses[i] = &proto
				}
			} else {
				// Convert to Proto with metrics (calculate on the fly)
				protoWarehouses = make([]*pb.WarehouseWithMetrics, 0, len(warehouses))
				for _, w := range warehouses {
					totalStock, _ := h.warehouseStockRepository.GetTotalStockByWarehouse(ctx, w.UUID)
					var utilization float64
					if w.Capacity > 0 {
						utilization = (float64(totalStock) / float64(w.Capacity)) * 100
						if utilization > 100 {
							utilization = 100
						}
					}
					protoWarehouses = append(protoWarehouses, &pb.WarehouseWithMetrics{
						Warehouse:   h.warehouseToProto(&w),
						TotalStock:  int32(totalStock),
						Utilization: utilization,
					})
				}
			}

			// Send update
			update := &pb.WarehouseUpdate{
				Warehouses: protoWarehouses,
				Timestamp:  time.Now().Format(time.RFC3339),
			}

			if err := stream.Send(update); err != nil {
				log.Printf("Failed to send warehouse update: %v", err)
				return status.Errorf(codes.Internal, "Failed to send update: %v", err)
			}
			log.Printf("Sent warehouse update %d warehouses", len(protoWarehouses))
		}
	}
}

func (h *WarehouseGRPCHandler) warehouseToProto(w *domain.Warehouse) *pb.Warehouse {
	return &pb.Warehouse{
		Uuid:         w.UUID,
		Name:         w.Name,
		Address:      w.Address,
		City:         w.City,
		State:        w.State,
		Country:      w.Country,
		PostalCode:   w.PostalCode,
		ManagerName:  w.ManagerName,
		ManagerEmail: w.ManagerEmail,
		ManagerPhone: w.ManagerPhone,
		Capacity:     int32(w.Capacity),
		IsActive:     w.IsActive,
		CreatedAt:    w.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    w.UpdatedAt.Format(time.RFC3339),
	}
}

func (h *WarehouseGRPCHandler) warehouseToProtoWithMetrics(w domain.WarehouseWithMetrics) pb.WarehouseWithMetrics {
	return pb.WarehouseWithMetrics{
		Warehouse:   h.warehouseToProto(&w.Warehouse),
		TotalStock:  int32(w.TotalStock),
		Utilization: w.Utilization,
	}
}
