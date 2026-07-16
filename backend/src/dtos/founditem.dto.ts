import z from "zod";
import { FoundItemSchema } from "../types/founditem.type";

export const CreateFoundItemDTO = FoundItemSchema.pick({
  itemCategory: true,
  condition: true,
  brandColor: true,
  estimatedValue: true,
  location: true,
  description: true,
  photos: true,
});

export type CreateFoundItemDTO = z.infer<typeof CreateFoundItemDTO>;

export const UpdateFoundItemDTO = FoundItemSchema.partial().pick({
  itemCategory: true,
  condition: true,
  brandColor: true,
  estimatedValue: true,
  location: true,
  description: true,
  photos: true,
});

export type UpdateFoundItemDTO = z.infer<typeof UpdateFoundItemDTO>;

export const UpdateFoundItemStatusDTO = z.object({
  status: z.enum(["Unclaimed", "Claimed"]),
  claimedBy: z.string().optional(),
});

export type UpdateFoundItemStatusDTO = z.infer<typeof UpdateFoundItemStatusDTO>;
