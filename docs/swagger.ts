import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerAuthPaths } from "./auth";
import { registerHotelPaths } from "./hotels";

// Create registry
const registry = new OpenAPIRegistry();

// Register security scheme for JWT
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Register all auth paths
registerAuthPaths(registry);
registerHotelPaths(registry);

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Library API",
    version: "1.0.0",
    description: "A simple Express VacQ API with authentication",
  },
  servers: [
    {
      url: "http://localhost:5003/api/v1",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Hotels",
      description: "Hotel management endpoints",
    },
  ],
});
