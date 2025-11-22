import { z } from "zod";

export const HotelSchema = z.object({
  _id: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
  name: z.string().openapi({ example: "Grand Hotel" }),
  address: z.string().openapi({ example: "123 Main St, Bangkok" }),
  telephone: z.string().openapi({ example: "02-123-4567" }),
  starRating: z.number().min(1).max(5).openapi({ example: 5 }),
  totalRooms: z.number().min(1).openapi({ example: 5 }),
});

export const HotelRequestSchema = z.object({
  name: z.string(),
  address: z.string(),
  telephone: z.string(),
  starRating: z.number().min(1).max(5),
  totalRooms: z.number().min(1),
});

export const HotelResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: HotelSchema,
});

export const HotelsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  count: z.number().openapi({ example: 10 }),
  data: z.array(HotelSchema),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().optional(),
});
