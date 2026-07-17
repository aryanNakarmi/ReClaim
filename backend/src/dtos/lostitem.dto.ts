import z from "zod";

export const CreateLostItemDTO = z.object({
  itemCategory: z
    .string()
    .min(1, "Item category is required")
    .min(2, "Item category must be at least 2 characters")
    .trim(),

  location: z
    .string()
    .min(3, "Location is required")
    .trim(),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional()
    .nullable(),

  imageUrl: z
    .string()
    .min(1, "Image URL is required"),
});

export type CreateLostItemDTO = z.infer<typeof CreateLostItemDTO>;

export const RejectLostItemDTO = z.object({
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required")
    .min(5, "Please provide a detailed reason")
    .max(300, "Reason cannot exceed 300 characters")
    .trim(),
});

export type RejectLostItemDTO = z.infer<typeof RejectLostItemDTO>;
