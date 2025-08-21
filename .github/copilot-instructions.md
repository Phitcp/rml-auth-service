# RML Auth Service - AI Coding Instructions

## Architecture Overview
This is a **gRPC microservice** built with NestJS that handles authentication, authorization, and user management. The service runs two gRPC servers on ports 4001 (auth) and 4002 (rbac), with external integrations to a character service on port 4003.

## Key Patterns & Conventions

### gRPC Service Structure
- **Proto-first development**: All interfaces are defined in `.proto` files and generated to TypeScript
- **Dual service architecture**: AuthService (login/tokens) + RBACService (permissions)
- **Context propagation**: Every method receives `AppContext` with `traceId` for distributed tracing
- **Metadata handling**: Use `getContext(metadata)` to extract trace IDs and user info from gRPC metadata

### Authentication Flow
- **JWT + Refresh Token**: 5-minute access tokens with 7-day refresh tokens
- **Token blacklisting**: Logout adds access tokens to Redis blacklist with TTL until natural expiration
- **Session management**: Each login creates a `sessionId` for granular token control
- **Token rotation security**: Tracks `usedTokenHashes` to detect token replay attacks

### Database Patterns
- **Repository pattern**: All MongoDB access through `MongooseRepositoryBase<T>` extending repositories
- **Schema-driven**: Mongoose schemas in `/schemas/` with proper typing
- **Transaction support**: Base repository provides transaction methods when needed

### Service Communication
- **External gRPC calls**: Character service integration using `GrpcClient` utility
- **Bulk operations**: Prefer bulk calls (e.g., `getCharacterProfileByBulk`) over individual requests
- **Error handling**: Wrap external calls in try-catch, continue without optional data

### Configuration & Environment
- **Path aliases**: Extensive use of TypeScript path mapping (`@auth/*`, `@shared/*`, `@repositories/*`)
- **Config modules**: Environment variables handled through NestJS ConfigService
- **Redis integration**: Used for OTP storage, token blacklisting, and permission caching

### Logging & Observability
- **Structured logging**: Use `AppLogger` with fluent API: `.addLogContext(traceId).addMsgParam(method).log(message)`
- **Method tracing**: Log "WILL/DID" patterns for operation start/completion
- **Error context**: Include user IDs, session IDs in error logs for debugging

## Development Workflow

### Running Services
```bash
npm run start:dev  # Development with hot reload
npm run start:prod # Production mode
```

### Key Files for Common Tasks
- **Add new auth endpoint**: Update `src/proto/auth.proto` → regenerate interfaces → implement in `auth.service.ts` → add controller method
- **Database operations**: Extend repository in `/repositories/` using `MongooseRepositoryBase`
- **External service calls**: Use `GrpcClient` utility in service constructors
- **Configuration**: Add to `/config/` modules with proper interface typing

### Security Considerations
- **Token validation**: Always check blacklist before JWT verification in guards/interceptors
- **Password handling**: Use bcrypt with salt rounds of 10
- **Input validation**: Proto definitions provide type safety, add business logic validation in services
- **Error responses**: Use typed error classes from `/interface/error.response.ts`

## Critical Integration Points
- **Character Service**: External gRPC service for user profiles - handle failures gracefully
- **Redis**: Session management and caching - ensure connection resilience
- **MongoDB**: Primary data store - use transactions for multi-document operations
- **Email Service**: OTP delivery (currently mocked) - implement proper SMTP configuration

## Testing Approach
- **Unit tests**: Jest configuration for service logic testing
- **E2E tests**: gRPC client testing against running services
- **Mock external services**: Character service calls should be mockable for testing
