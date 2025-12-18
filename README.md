# StockHub

## Description

StockHub is a comprehensive inventory management system designed to help businesses efficiently track, manage, and monitor their stock across multiple warehouses. The platform provides real-time updates, detailed analytics, and complete audit trails for all inventory operations.

## Overview

StockHub is a full-stack inventory management application built with modern technologies to deliver a seamless user experience. The system enables businesses to manage products, categories, suppliers, warehouses, and track all stock movements in real-time. With features like low stock alerts, warehouse utilization monitoring, and comprehensive movement history, StockHub helps businesses maintain optimal inventory levels and make data-driven decisions.

### Key Features

- **Real-time Updates**: Live data streaming using gRPC for instant inventory updates
- **Multi-warehouse Management**: Track inventory across multiple warehouse locations
- **Stock Movement Tracking**: Complete audit trail of all stock movements (IN, OUT, TRANSFER, ADJUSTMENT)
- **Low Stock Alerts**: Automated notifications for products below threshold levels
- **Warehouse Utilization**: Monitor capacity usage and optimize warehouse space
- **Product Catalog**: Comprehensive product management with SKU, barcode, and pricing
- **Supplier Management**: Maintain supplier information and relationships
- **Category Organization**: Organize products with flexible category system

## Technologies

### Backend
- **Go 1.24** - High-performance backend server
- **Gorilla Mux** - HTTP router and web framework
- **gRPC** - Real-time data streaming and microservices communication
- **GORM** - ORM for database operations
- **PostgreSQL** - Relational database for data persistence
- **Protocol Buffers** - Efficient data serialization for gRPC

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Data fetching and state management
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Dashboard Key Features

![Dashboard](assets/dashboard.png)

- **Warehouse Utilization Monitoring**: Real-time display of top 5 warehouses sorted by capacity utilization with visual progress indicators
- **Recent Stock Movements**: Live feed of the latest 5 stock movements across all warehouses with movement type badges
- **Top Products by Price**: Real-time list of top 5 highest-priced products with current stock information
- **Stock Alerts**: Automated alerts for out-of-stock and low-stock products with threshold monitoring and status indicators

## Product Catalog Features

![Products](assets/products.png)

- **Product Management**: Create, update, and delete products with comprehensive details including title, description, price, and stock levels
- **Dual View Modes**: Switch between grid and table views for flexible product browsing
- **Stock Tracking**: Monitor current stock levels with visual indicators and low stock threshold alerts
- **Product Details**: Manage SKU, barcode, pricing, and associate products with categories and suppliers
- **Stock Status Badges**: Visual indicators showing stock status (in stock, low stock, out of stock)

## Categories Features

![Categories](assets/categories.png)

- **Category Management**: Create and organize product categories with name and description
- **Category Listing**: View all categories in an organized list format
- **Category Updates**: Edit category information to maintain accurate product organization
- **Category Deletion**: Remove unused categories with proper validation

## Suppliers Features

![Suppliers](assets/suppliers.png)

- **Supplier Management**: Maintain comprehensive supplier information including name, email, phone, and address
- **Contact Information**: Store contact person details and communication channels for each supplier
- **Supplier Listing**: View all suppliers with their complete contact information
- **Supplier Updates**: Edit supplier details to keep information current

## Warehouses Features

![Warehouses](assets/warehouses.png)

- **Warehouse Management**: Create and manage multiple warehouse locations with complete address information
- **Warehouse Details**: Store warehouse name, address, city, state, country, and postal code
- **Manager Information**: Track warehouse manager details including name, email, and phone
- **Capacity Management**: Set and monitor warehouse capacity with utilization tracking
- **Active Status**: Enable or disable warehouses as needed
- **Stock Tracking**: View stock levels for each warehouse location
- **Stock Transfers**: Transfer stock between warehouses with complete audit trail

## Stock Movement Features

![Stock Movements](assets/stock-movements.png)

- **Movement Types**: Track multiple movement types including Stock IN, Stock OUT, Transfer, and Adjustment
- **Complete Audit Trail**: View detailed history of all stock movements with timestamps and user information
- **Movement Filtering**: Filter movements by type (Stock IN, Stock OUT, Transfer, Adjustment, or All)
- **Stock IN Management**: Record incoming stock with purchase order numbers and supplier information
- **Stock OUT Management**: Track outgoing stock with sales order numbers and customer details
- **Stock Adjustments**: Record inventory adjustments with reasons (damage, loss, expired, correction, theft, other)
- **Reference Tracking**: Link movements to purchase orders, sales orders, or other reference numbers
- **Quantity Tracking**: Monitor previous quantity, movement quantity, and new quantity for each transaction
- **Real-time Updates**: Live movement stream showing the most recent stock activities

## How to Start the Application

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Go dependencies:
```bash
go mod download
```

3. Set up environment variables (create `.env` file):
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stockhub
PORT=:7788
GRPC_PORT=:50051
CORS_ALLOWED_ORIGINS=*
```

4. Ensure PostgreSQL is running and the database exists

5. Run the application:
```bash
go run cmd/app/server.go
```

The backend will start on:
- HTTP Server: `http://localhost:7788`
- gRPC Server: `localhost:50051`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env` file):
```env
VITE_API_URL=http://localhost:7788/api
VITE_GRPC_URL=http://localhost:50051
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port)

## Deployment using Docker

### Backend Deployment

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file with the following variables:
```env
DATABASE_URL=postgres://postgres:postgres@db:5432/stockhub
PORT=:7788
GRPC_PORT=:50051
CORS_ALLOWED_ORIGINS=*
```

3. Build and run using Docker Compose:
```bash
docker-compose up -d
```

Or build the Docker image manually:
```bash
docker build -t stockhub-backend .
docker run -p 7788:7788 -p 50051:50051 --env-file .env stockhub-backend
```

### Frontend Deployment

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Build the Docker image with build arguments:
```bash
docker build \
  --build-arg VITE_API_URL=http://your-backend-url:7788/api \
  --build-arg VITE_GRPC_URL=http://your-backend-url:50051 \
  -t stockhub-frontend .
```

3. Run the container:
```bash
docker run -p 1234:80 stockhub-frontend
```

Or use Docker Compose:
```bash
docker-compose up -d
```

The frontend will be available on `http://localhost:1234`

### Environment Variables

#### Backend `.env`
```env
# Database connection string
DATABASE_URL=postgres://username:password@host:port/database

# HTTP server port (with colon prefix)
PORT=:7788

# gRPC server port (with colon prefix)
GRPC_PORT=:50051

# CORS allowed origins (use * for all or specify domains)
CORS_ALLOWED_ORIGINS=*
```

#### Frontend `.env`
```env
# Backend API URL for HTTP requests
VITE_API_URL=http://localhost:7788/api

# Backend gRPC URL for real-time streaming
VITE_GRPC_URL=http://localhost:50051
```

**Note**: For production deployments, update the frontend environment variables to point to your production backend URLs.

## Page Features

### Dashboard
The dashboard provides a comprehensive overview of your inventory operations with real-time updates:
- Warehouse utilization metrics
- Recent stock movements
- Top products by price
- Stock alerts and notifications

### Product Catalog
Manage your entire product inventory with ease:
- Grid and table view options
- Product creation and editing
- Stock level monitoring
- Category and supplier associations

### Categories
Organize your products with a flexible category system:
- Create and manage categories
- Associate products with categories
- Maintain category descriptions

### Suppliers
Keep track of all your suppliers:
- Store contact information
- Manage supplier relationships
- Link suppliers to products

### Warehouses
Monitor and manage multiple warehouse locations:
- Track warehouse capacity and utilization
- Manage warehouse details and managers
- View stock levels per warehouse
- Transfer stock between warehouses

### Stock Movements
Complete audit trail of all inventory transactions:
- View all movement types
- Filter by movement type
- Track reference numbers
- Monitor quantity changes
- Real-time movement updates

---

**StockHub** - Streamline your inventory management with real-time tracking and comprehensive analytics.

