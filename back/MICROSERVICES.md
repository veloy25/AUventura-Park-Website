# Microservices Architecture Guide

## Overview

This backend is organized as a microservices architecture with the following components:

- **API Gateway** (Port 3000) - Main entry point, routes requests to services
- **User Service** (Port 3001) - Authentication & user management
- **Testimonials Service** (Port 3002) - Testimonials management
- **Scheduling Service** (Port 3003) - Appointments management
- **Shared Modules** - Database, authentication, message bus
- **Message Bus** - Event-driven communication between services

## Project Structure

```
back/
├── services/
│   ├── api-gateway/              # API Gateway service
│   │   ├── index.js
│   │   └── package.json
│   ├── user-service/             # User authentication service
│   │   ├── index.js
│   │   └── package.json
│   ├── testimonials-service/     # Testimonials service
│   │   ├── index.js
│   │   └── package.json
│   └── agendamentos-service/     # Scheduling service
│       ├── index.js
│       ├── package.json
│       └── schema.sql
├── shared/                       # Shared utilities
│   ├── messagebus.js            # Event bus for inter-service communication
│   ├── database.js              # Database connection pool
│   └── auth.js                  # JWT authentication utilities
├── docker-compose.yml           # Docker composition for local development
├── .env.example                 # Environment variables template
├── package.json                 # Root package (optional)
└── README.md                    # This file
```

## Running Locally

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Setup Steps

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Install dependencies for each service:**

```bash
# API Gateway
cd services/api-gateway
npm install
cd ../..

# User Service
cd services/user-service
npm install
cd ../..

# Testimonials Service
cd services/testimonials-service
npm install
cd ../..

# Scheduling Service
cd services/agendamentos-service
npm install
cd ../..
```

3. **Start all services (in separate terminals):**

```bash
# Terminal 1: API Gateway
cd services/api-gateway
npm start

# Terminal 2: User Service
cd services/user-service
npm start

# Terminal 3: Testimonials Service
cd services/testimonials-service
npm start

# Terminal 4: Scheduling Service
cd services/agendamentos-service
npm start
```

The API Gateway will be available at `http://localhost:3000`

### Using Docker Compose

```bash
docker-compose up --build
```

This will start:
- MySQL database (port 3306)
- API Gateway (port 3000)
- User Service (port 3001)
- Testimonials Service (port 3002)
- Scheduling Service (port 3003)

## API Endpoints

All endpoints are accessed through the API Gateway at `http://localhost:3000`

### User Service Endpoints

- `POST /api/signup` - Register a new user
- `POST /api/login` - Login and receive JWT token
- `GET /api/me` - Get current user profile (requires Authorization header)

### Testimonials Service Endpoints

- `GET /api/depoimentos` - Get all testimonials
- `POST /api/depoimentos` - Create a new testimonial
- `GET /api/depoimentos/:id` - Get a specific testimonial

### Scheduling Service Endpoints

- `GET /api/agendamentos` - Get current user appointments
- `POST /api/agendamentos` - Create a new appointment

## Message Bus Events

The services communicate through the Message Bus using events:

### User Service Events
- **user:created** - Published when a new user is created
- **user:logged-in** - Published when a user logs in

### Testimonials Service Events
- **testimonial:created** - Published when a new testimonial is created

### Example Usage in Services

```javascript
// Subscribe to events
messageBus.subscribe("user:created", "service-name", (event) => {
  console.log("New user created:", event.data);
});

// Publish events
messageBus.publish("user:created", userData, "user-service");
```

## Adding New Services

To add a new microservice:

1. Create a new directory under `services/`
2. Create `index.js` with Express app
3. Create `package.json` with dependencies
4. Add routes to the API Gateway to forward requests
5. Subscribe to relevant events in `messagebus.js`
6. Add service to `docker-compose.yml`

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` / `*_SERVICE_PORT` - Service ports
- `DB_*` - Database connection settings
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - Token expiration time
- `*_SERVICE_URL` - Service URLs for the API Gateway

## Development Tips

1. **Use nodemon** - Services auto-reload on file changes (already configured)
2. **Check service health** - Visit `http://localhost:3000/health`
3. **Debug with logs** - All services log to console with service names in brackets
4. **Separate concerns** - Keep business logic in services, routing in gateway

## Scaling Considerations

Future improvements:
- Use RabbitMQ or Redis for message bus (instead of in-memory EventEmitter)
- Add service discovery mechanism
- Implement API Gateway authentication/authorization
- Add request/response logging middleware
- Implement circuit breaker pattern for service calls
