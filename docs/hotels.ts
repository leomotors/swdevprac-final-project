import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  HotelRequestSchema,
  HotelResponseSchema,
  HotelsResponseSchema,
  ErrorResponseSchema,
} from "../schemas/hotels";

export function registerHotelPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/hotels",
    description: "Get all hotels",
    summary: "Get All Hotels",
    tags: ["Hotels"],
    responses: {
      200: {
        description: "Hotels retrieved successfully",
        content: {
          "application/json": {
            schema: HotelsResponseSchema,
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

  registry.registerPath({
    method: "get",
    path: "/hotels/{id}",
    description: "Get single hotel by ID",
    summary: "Get Hotel",
    tags: ["Hotels"],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Hotel retrieved successfully",
        content: {
          "application/json": {
            schema: HotelResponseSchema,
          },
        },
      },
      404: {
        description: "Hotel not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/hotels",
    description: "Create a new hotel",
    summary: "Create Hotel",
    tags: ["Hotels"],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: HotelRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Hotel created successfully",
        content: {
          "application/json": {
            schema: HotelResponseSchema,
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
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Admin only",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/hotels/{id}",
    description: "Update hotel by ID",
    summary: "Update Hotel",
    tags: ["Hotels"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: HotelRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Hotel updated successfully",
        content: {
          "application/json": {
            schema: HotelResponseSchema,
          },
        },
      },
      404: {
        description: "Hotel not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Admin only",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/hotels/{id}",
    description: "Delete hotel by ID",
    summary: "Delete Hotel",
    tags: ["Hotels"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Hotel deleted successfully",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Hotel not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Admin only",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
}
