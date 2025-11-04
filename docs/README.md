# API Documentation Structure

This folder contains the OpenAPI/Swagger documentation configuration for the API.

## File Structure

```
docs/
├── swagger.ts          # Main Swagger configuration and document generation
├── auth.ts            # Authentication endpoint documentation
└── README.md          # This file

schemas/
└── auth.ts            # Zod schemas for authentication endpoints
```

## Files Description

### `swagger.ts`

- Main entry point for OpenAPI document generation
- Configures the OpenAPI specification metadata (title, version, servers, etc.)
- Registers security schemes (JWT Bearer tokens)
- Combines all endpoint documentation

### `auth.ts`

- Contains OpenAPI path definitions for authentication endpoints
- Defines request/response schemas for each endpoint
- Includes proper HTTP status codes and error responses

### `../schemas/auth.ts`

- Contains Zod schemas used for both validation and OpenAPI documentation
- Extends Zod with OpenAPI functionality
- Defines reusable request and response schemas

## Adding New Endpoints

To add documentation for new endpoints:

1. Create schemas in the appropriate `schemas/` file
2. Create path definitions in a new docs file (e.g., `docs/users.ts`)
3. Import and register the paths in `swagger.ts`

## Usage

The OpenAPI document is imported in `server.ts` and served at `/api-docs`.

```typescript
import { openApiDocument } from "./docs/swagger";
app.use("/api-docs", swaggerUI.serve);
app.get("/api-docs", swaggerUI.setup(openApiDocument));
```
