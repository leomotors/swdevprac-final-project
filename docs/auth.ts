import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  AuthSuccessResponseSchema,
  ErrorResponseSchema,
  MeResponseSchema,
} from "../schemas/auth";

export function registerAuthPaths(registry: OpenAPIRegistry) {
  // Register POST /auth/register
  registry.registerPath({
    method: "post",
    path: "/auth/register",
    description: "Register a new user account",
    summary: "User Registration",
    tags: ["Authentication"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: AuthSuccessResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // Register POST /auth/login
  registry.registerPath({
    method: "post",
    path: "/auth/login",
    description: "Login with email and password",
    summary: "User Login",
    tags: ["Authentication"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: AuthSuccessResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - invalid credentials",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - validation error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // Register GET /auth/me
  registry.registerPath({
    method: "get",
    path: "/auth/me",
    description: "Get current user information",
    summary: "Get Current User",
    tags: ["Authentication"],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "User information retrieved successfully",
        content: {
          "application/json": {
            schema: MeResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - invalid or missing token",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // Register GET /auth/logout
  registry.registerPath({
    method: "get",
    path: "/auth/logout",
    description: "Logout user and clear authentication token",
    summary: "User Logout",
    tags: ["Authentication"],
    responses: {
      200: {
        description: "Logout successful",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z
                .string()
                .openapi({ example: "Logged out successfully" }),
            }),
          },
        },
      },
    },
  });
}
