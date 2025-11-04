import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

const userRoleEnum = z
  .enum(["user", "admin"])
  .openapi({
    description: "Role of the user",
    example: "user",
  })
  .openapi("UserRole");

// Auth request schemas
export const RegisterRequestSchema = z
  .object({
    name: z.string().openapi({
      example: "John Doe",
      description: "User's full name",
    }),
    email: z.email().openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
    password: z.string().openapi({
      example: "password123",
      description: "User's password",
    }),
    role: userRoleEnum,
  })
  .openapi("RegisterRequest");

export const LoginRequestSchema = z
  .object({
    email: z.email().openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
    password: z.string().openapi({
      example: "password123",
      description: "User's password",
    }),
  })
  .openapi("LoginRequest");

// Auth response schemas
export const AuthSuccessResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    token: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      description: "JWT authentication token",
    }),
  })
  .openapi("AuthSuccessResponse");

export const ErrorResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: false }),
    error: z.string().openapi({
      example: "Invalid credentials",
      description: "Error message",
    }),
  })
  .openapi("ErrorResponse");

export const PublicUserSchema = z
  .object({
    _id: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "user@example.com" }),
    role: userRoleEnum,
    createdAt: z.string().openapi({ example: "2023-11-05T10:30:00.000Z" }),
  })
  .openapi("PublicUser", { description: "User Public Data" });

export const MeResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: PublicUserSchema,
  })
  .openapi("MeResponse");
