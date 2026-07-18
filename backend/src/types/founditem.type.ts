 import z from "zod";

export const FoundItemSchema = z.object({
  itemCategory: z
    .string()
    .min(2, "Item category must be at least 2 characters")
    .max(50, "Item category cannot exceed 50 characters")
    .transform((val) =>
      val
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    ),
 
  condition: z
    .enum(["New", "Like New", "Good", "Fair", "Damaged"])
    .refine(
      (val) => ["New", "Like New", "Good", "Fair", "Damaged"].includes(val),
      { message: "Condition must be New, Like New, Good, Fair, or Damaged" }
    ),

  brandColor: z
    .string()
    .min(1, "Brand/Color is required")
    .min(2, "Brand/Color must be at least 2 characters")
    .trim(),

  estimatedValue: z
    .number()
    .min(0, "Estimated value must be 0 or greater")
    .int("Estimated value must be a whole number"),

  location: z
    .string()
    .min(1, "Location is required")
    .min(3, "Location must be at least 3 characters")
    .trim(),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .trim()
    .optional()
    .nullable(),

  photos: z
    .array(z.string().min(1, "Photo URL is required"))
    .min(1, "At least one photo is required")
    .max(5, "Maximum 5 photos allowed"),

  status: z.enum(["Unclaimed", "Claimed"]).optional(),
  claimedBy: z.string().optional().nullable(),
  claimedDate: z.date().optional().nullable(),
});

export type FoundItemType = z.infer<typeof FoundItemSchema>;
