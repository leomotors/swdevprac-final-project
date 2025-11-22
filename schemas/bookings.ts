import { z } from "zod";

export const BookingSchema = z.object({
  _id: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
  startDate: z.string().openapi({ example: "2024-12-01" }),
  endDate: z.string().openapi({ example: "2024-12-03" }),
  user: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
  hotel: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
  roomNumber: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: "2023-11-05T10:30:00.000Z" }),
});

export const BookingRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  hotel: z.string(),
  roomNumber: z.number().int().positive(),
});

export const BookingResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: BookingSchema,
});

export const BookingsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  count: z.number().openapi({ example: 3 }),
  data: z.array(BookingSchema),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().optional(),
});
