# EasyOps - Technical Specification

Technical implementation details for the EasyOps Sweet Swirls Operations App.

## Current Implementation Status

- **Backend**: Spring Boot 3.4.4 API with PostgreSQL/H2 database
- **Frontend**: React 19 + TypeScript with CSS Modules
- **Authentication**: JWT-based with role-based access control

## Architecture Overview

### Backend (Spring Boot 3.4.4)
- **Package Structure**: `com.iowaicecreamconcepts.api`
- **Database**: PostgreSQL (production), H2 (development/testing)
- **Java Version**: 21 with Lombok
- **Security**: Spring Security with JWT authentication

### Frontend (React 19 + TypeScript)
- **Styling**: CSS Modules with custom design system
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React icon library
- **Build**: Create React App with TypeScript template

## Implementation Mapping

### Permission Scopes to Roles
Based on the business requirements, the technical implementation uses these role mappings:

- **Owner/Admin** → `ADMIN` role (all permissions)
- **General Manager** → `PRODUCTION_LEAD` role (location-specific full access)
- **Shift Lead** → `SHIFT_LEAD` role (operational access)
- **Crew Member** → `TEAM_MEMBER` role (task-focused access)

### API Endpoints Structure

**Base URL**: `/api`

#### Inventory Management
- `GET/POST/PUT/DELETE /inventory/items` - Item library CRUD
- `POST /inventory/sessions` - Create inventory session
- `POST /inventory/sessions/{id}/lines` - Add line items
- `POST /inventory/sessions/{id}/close` - Close session
- `GET /inventory/current` - Current stock view

#### Production Management  
- `GET/POST/PATCH /production/requests` - Production request lifecycle
- `POST /production/batches` - Record production batches
- `POST /production/batches/{id}/runout` - Mark batch as depleted
- `POST /production/batches/{id}/waste` - Record waste events

#### Authentication
- `POST /auth/login` - JWT authentication

## Data Model Implementation

### Core Entities
- `User` - Authentication and role assignment
- `Location` - Physical and logical locations
- `InventoryItem` - Item library with par levels
- `InventorySession` - Inventory counting sessions
- `InventorySessionLine` - Individual count records
- `ProductionRequest` - Production workflow requests
- `ProductionBatch` - Batch tracking and lifecycle
- `WasteEvent` - Waste logging and tracking

### Key Technical Decisions
- **UUID Primary Keys**: All entities use UUID for primary keys
- **Timestamp Tracking**: createdAt/updatedAt on all entities
- **Immutable Records**: Closed inventory sessions and completed batches are immutable
- **Soft Deletes**: Items marked inactive rather than deleted
- **Audit Trail**: Who/when tracking for all significant operations

## Development Workflow

### Backend Development
```bash
./gradlew build           # Build project
./gradlew bootRun         # Run development server (port 8080)
./gradlew test            # Run test suite
./gradlew clean build     # Clean build
```

### Frontend Development
```bash
cd frontend
npm install               # Install dependencies
npm start                 # Development server (port 3000)
npm run build            # Production build
npm test                 # Run tests
npm run lint             # Code style check
npm run type-check       # TypeScript validation
```

## Environment Configuration

### Backend Profiles
- **Default**: Basic application settings
- **Local**: Development configuration
- **Test**: H2 database for testing

### Frontend Environment
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=Sweet Swirls Operations
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

## Security Implementation

- **Authentication**: JWT tokens with 7-day expiry
- **Authorization**: Role-based access control enforced server-side
- **Validation**: Server-side input validation for all endpoints
- **Audit**: Logging of significant operations (CRUD, session close, batch events)

## Performance Requirements

- **Mobile-First**: Optimized for 360px-1280px viewports
- **Load Time**: Dashboard loads < 2s with 1k items
- **Reliability**: Optimistic UI with retry logic for network issues
- **Offline**: Basic offline capability for inventory counting (Phase 2)

## Testing Strategy

### Backend Testing
- **Unit Tests**: JUnit 5 with Mockito
- **Integration Tests**: Spring Boot Test for API endpoints
- **Coverage**: JaCoCo for test coverage reporting

### Frontend Testing
- **Component Tests**: React Testing Library
- **Type Safety**: TypeScript strict mode
- **E2E Testing**: Planned for critical user workflows

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment Architecture

### Development
- Backend: localhost:8080
- Frontend: localhost:3000
- Database: H2 (embedded)

### Production (Planned)
- Backend: Containerized Spring Boot application
- Frontend: Static build served by CDN
- Database: PostgreSQL instance
- Authentication: JWT with secure token storage