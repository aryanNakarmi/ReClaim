import z from "zod";

export const LostItemSchema = z.object({
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

  reportedBy: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export type LostItemType = z.infer<typeof LostItemSchema>;
