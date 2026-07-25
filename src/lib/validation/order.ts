import { z } from "zod";
import { SIZES } from "@/lib/mock-data";

export const lineItemSchema = z.object({
  size: z.enum(SIZES),
  qty: z.number().int().min(1).max(20),
  playerName: z.string().trim().max(16).optional().default(""),
});

export const orderSubmissionSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    phone: z.string().trim().min(7, "Please enter a valid mobile number.").max(20),
    messengerName: z.string().trim().max(100).optional().default(""),
    fulfillment: z.enum(["pickup", "delivery"]),
    address: z.string().trim().max(300).optional().default(""),
    paymentReference: z.string().trim().max(100).optional().default(""),
    customerNotes: z.string().trim().max(500).optional().default(""),
    paymentProofPath: z.string().trim().min(1, "Payment proof upload is required."),
    cart: z.array(lineItemSchema).min(1, "Add at least one shirt to your order.").max(50),
  })
  .refine(
    (data) => data.fulfillment === "pickup" || data.address.trim().length >= 5,
    {
      message: "Please enter a complete delivery address.",
      path: ["address"],
    }
  );

export type OrderSubmission = z.infer<typeof orderSubmissionSchema>;
