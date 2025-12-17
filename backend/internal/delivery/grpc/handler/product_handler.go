package handler

import (
	"context"
	"log"
	"time"

	"github.com/shirloin/stockhub/internal/repository"
	pb "github.com/shirloin/stockhub/proto/product"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ProductGRPCHandler struct {
	pb.UnimplementedProductServiceServer
	productRepository *repository.ProductRepository
}

func NewProductGRPCHandler(productRepository *repository.ProductRepository) *ProductGRPCHandler {
	return &ProductGRPCHandler{productRepository: productRepository}
}

func (h *ProductGRPCHandler) WatchTopProductsByPrice(req *pb.WatchTopProductsByPriceRequest, stream pb.ProductService_WatchTopProductsByPriceServer) error {
	updates := h.productRepository.SubscribeToChanges()

	ctx := context.Background()
	limit := int(req.Limit)
	if limit <= 0 {
		limit = 5 // Default to 5 if not specified
	}

	// Get initial top products by price
	initialProducts, err := h.productRepository.GetTopByPrice(ctx, limit)
	if err != nil {
		return status.Errorf(codes.Internal, "Failed to get initial top products: %v", err)
	}

	protoProducts := make([]*pb.Product, len(initialProducts))
	for i, p := range initialProducts {
		protoProducts[i] = p.ToProto()
	}

	// Send initial state
	if err := stream.Send(&pb.PriceUpdate{Products: protoProducts, Timestamp: time.Now().Format(time.RFC3339)}); err != nil {
		return status.Errorf(codes.Internal, "Failed to send initial top products: %v", err)
	}
	log.Printf("Sent initial top products by price %d products", len(protoProducts))

	// Stream updates when products change
	for {
		select {
		case <-stream.Context().Done():
			log.Println("Top products by price client disconnected")
			return nil
		case <-updates:
			// Product change detected, get updated top products by price
			topProducts, err := h.productRepository.GetTopByPrice(ctx, limit)
			if err != nil {
				log.Printf("Error getting top products by price: %v", err)
				continue
			}

			// Convert to Proto
			protoProducts := make([]*pb.Product, len(topProducts))
			for i, p := range topProducts {
				protoProducts[i] = p.ToProto()
			}

			// Send update
			update := &pb.PriceUpdate{Products: protoProducts, Timestamp: time.Now().Format(time.RFC3339)}

			if err := stream.Send(update); err != nil {
				log.Printf("Failed to send top products by price update: %v", err)
				return status.Errorf(codes.Internal, "Failed to send update: %v", err)
			}
			log.Printf("Sent top products by price update %d products", len(protoProducts))
		}
	}
}

func (h *ProductGRPCHandler) WatchStockAlerts(req *pb.WatchStockAlertsRequest, stream pb.ProductService_WatchStockAlertsServer) error {
	updates := h.productRepository.SubscribeToChanges()

	ctx := context.Background()

	// Send initial alerts
	lowStockProducts, err := h.productRepository.GetLowStockProducts(ctx)
	if err != nil {
		return status.Errorf(codes.Internal, "Failed to get low stock products: %v", err)
	}

	log.Printf("Found %d low stock products from database", len(lowStockProducts))
	for _, p := range lowStockProducts {
		log.Printf("  - %s: stock=%d, threshold=%d", p.Title, p.Stock, p.LowStockThreshold)
	}

	protoAlerts := make([]*pb.StockAlert, len(lowStockProducts))
	for i, product := range lowStockProducts {
		alertType := "low_stock"
		if product.Stock == 0 {
			alertType = "out_of_stock"
		}

		protoAlerts[i] = &pb.StockAlert{
			ProductUuid:  product.UUID,
			ProductTitle: product.Title,
			CurrentStock: int32(product.Stock),
			Threshold:    int32(product.LowStockThreshold),
			AlertType:    alertType,
			Timestamp:    time.Now().Format(time.RFC3339),
		}
	}

	// Send initial state
	if err := stream.Send(&pb.StockAlertUpdate{Alerts: protoAlerts, Timestamp: time.Now().Format(time.RFC3339)}); err != nil {
		return status.Errorf(codes.Internal, "Failed to send initial stock alerts: %v", err)
	}
	log.Printf("Sent initial stock alerts %d alerts", len(protoAlerts))

	// Stream updates when products change
	for {
		select {
		case <-stream.Context().Done():
			log.Println("Stock alert client disconnected")
			return nil
		case products := <-updates:
			// Product change detected, get updated low stock products
			lowStockProducts, err := h.productRepository.GetLowStockProducts(ctx)
			if err != nil {
				log.Printf("Error getting low stock products: %v", err)
				continue
			}

			log.Printf("Found %d low stock products after product change (triggered by %d products)", len(lowStockProducts), len(products))
			for _, p := range lowStockProducts {
				log.Printf("  - %s: stock=%d, threshold=%d", p.Title, p.Stock, p.LowStockThreshold)
			}

			// Convert to Proto
			protoAlerts := make([]*pb.StockAlert, len(lowStockProducts))
			for i, product := range lowStockProducts {
				alertType := "low_stock"
				if product.Stock == 0 {
					alertType = "out_of_stock"
				}

				protoAlerts[i] = &pb.StockAlert{
					ProductUuid:  product.UUID,
					ProductTitle: product.Title,
					CurrentStock: int32(product.Stock),
					Threshold:    int32(product.LowStockThreshold),
					AlertType:    alertType,
					Timestamp:    time.Now().Format(time.RFC3339),
				}
			}

			// Send update
			update := &pb.StockAlertUpdate{Alerts: protoAlerts, Timestamp: time.Now().Format(time.RFC3339)}
			log.Printf("Sending stock alerts update %d alerts", len(protoAlerts))
			if err := stream.Send(update); err != nil {
				log.Printf("Failed to send stock alerts update: %v", err)
				return status.Errorf(codes.Internal, "Failed to send update: %v", err)
			}
			log.Printf("Sent stock alerts update %d alerts (triggered by %d product changes)", len(protoAlerts), len(products))
		}
	}
}
