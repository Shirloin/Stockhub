package handler

import (
	"context"
	"log"
	"time"

	"github.com/shirloin/stockhub/internal/domain"
	"github.com/shirloin/stockhub/internal/repository"
	pb "github.com/shirloin/stockhub/proto/movement"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type MovementGRPCHandler struct {
	pb.UnimplementedMovementServiceServer
	movementRepository *repository.StockMovementRepository
}

func NewMovementGRPCHandler(movementRepository *repository.StockMovementRepository) *MovementGRPCHandler {
	return &MovementGRPCHandler{
		movementRepository: movementRepository,
	}
}

func (h *MovementGRPCHandler) WatchMovements(req *pb.WatchMovementsRequest, stream pb.MovementService_WatchMovementsServer) error {
	updates := h.movementRepository.SubscribeToChanges()

	ctx := context.Background()

	// Get initial movements
	limit := int(req.Limit)
	initialMovements, err := h.movementRepository.GetAll(ctx, limit)
	if err != nil {
		return status.Errorf(codes.Internal, "Failed to get initial movements: %v", err)
	}

	protoMovements := make([]*pb.StockMovement, len(initialMovements))
	for i, m := range initialMovements {
		protoMovements[i] = h.movementToProto(&m)
	}

	// Send initial state
	if err := stream.Send(&pb.MovementUpdate{
		Movements: protoMovements,
		Timestamp: time.Now().Format(time.RFC3339),
	}); err != nil {
		return status.Errorf(codes.Internal, "Failed to send initial movements: %v", err)
	}

	// Stream updates
	for {
		select {
		case <-stream.Context().Done():
			log.Println("Movement client disconnected")
			return nil
		case movements := <-updates:
			// Convert to Proto
			protoMovements := make([]*pb.StockMovement, 0, len(movements))
			for _, m := range movements {
				protoMovements = append(protoMovements, h.movementToProto(&m))
			}

			// Apply limit if specified
			if limit > 0 && limit < len(protoMovements) {
				protoMovements = protoMovements[:limit]
			}

			// Send update
			update := &pb.MovementUpdate{
				Movements: protoMovements,
				Timestamp: time.Now().Format(time.RFC3339),
			}

			if err := stream.Send(update); err != nil {
				log.Printf("Failed to send movement update: %v", err)
				return status.Errorf(codes.Internal, "Failed to send update: %v", err)
			}
			log.Printf("Sent movement update %d movements", len(protoMovements))
		}
	}
}

func (h *MovementGRPCHandler) movementToProto(m *domain.StockMovement) *pb.StockMovement {
	proto := &pb.StockMovement{
		Uuid:             m.UUID,
		ProductUuid:      m.ProductUUID,
		WarehouseUuid:    m.WarehouseUUID,
		MovementType:     string(m.MovementType),
		Quantity:         int32(m.Quantity),
		PreviousQty:      int32(m.PreviousQty),
		NewQty:           int32(m.NewQty),
		ReferenceNumber:  m.ReferenceNumber,
		ToWarehouseUuid:  m.ToWarehouseUUID,
		AdjustmentReason: string(m.AdjustmentReason),
		Notes:            m.Notes,
		CreatedBy:        m.CreatedBy,
		MovementDate:     m.MovementDate.Format(time.RFC3339),
		CreatedAt:        m.CreatedAt.Format(time.RFC3339),
		UpdatedAt:        m.UpdatedAt.Format(time.RFC3339),
	}

	// Add product if loaded
	if m.Product.UUID != "" {
		proto.Product = &pb.Product{
			Uuid:  m.Product.UUID,
			Title: m.Product.Title,
		}
	}

	// Add warehouse if loaded
	if m.Warehouse.UUID != "" {
		proto.Warehouse = &pb.Warehouse{
			Uuid: m.Warehouse.UUID,
			Name: m.Warehouse.Name,
		}
	}

	return proto
}
