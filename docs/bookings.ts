import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  BookingRequestSchema,
  BookingResponseSchema,
  BookingsResponseSchema,
  ErrorResponseSchema,
} from "../schemas/bookings";

export function registerBookingPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/bookings",
    description:
      "Get all bookings. Regular users see their own bookings, admins see all bookings.",
    summary: "Get All Bookings",
    tags: ["Bookings"],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Bookings retrieved successfully",
        content: {
          "application/json": {
            schema: BookingsResponseSchema,
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
    },
  });

  registry.registerPath({
    method: "get",
    path: "/bookings/{id}",
    description:
      "Get single booking by ID. Users can only access their own bookings, admins can access any booking.",
    summary: "Get Booking",
    tags: ["Bookings"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Booking retrieved successfully",
        content: {
          "application/json": {
            schema: BookingResponseSchema,
          },
        },
      },
      401: {
        description: "Not authorized to access this booking",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Booking not found",
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
    path: "/bookings",
    description:
      "Create a new booking. Maximum 3 nights per booking. End date must be after start date.",
    summary: "Create Booking",
    tags: ["Bookings"],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: BookingRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Booking created successfully",
        content: {
          "application/json": {
            schema: BookingResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Invalid dates or exceeds 3 nights limit",
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
    method: "put",
    path: "/bookings/{id}",
    description:
      "Update booking by ID. Users can only update their own bookings, admins can update any booking. Maximum 3 nights per booking.",
    summary: "Update Booking",
    tags: ["Bookings"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: BookingRequestSchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Booking updated successfully",
        content: {
          "application/json": {
            schema: BookingResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Invalid dates or exceeds 3 nights limit",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Not authorized to update this booking",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Booking or hotel not found",
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
    path: "/bookings/{id}",
    description:
      "Delete booking by ID. Users can only delete their own bookings, admins can delete any booking.",
    summary: "Delete Booking",
    tags: ["Bookings"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Booking deleted successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              data: z.object({}),
            }),
          },
        },
      },
      401: {
        description: "Not authorized to delete this booking",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Booking not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
}
