import { z } from "zod";
import { PASSWORD_POLICY } from "./auth";
import { ORDER_STATUSES } from "../../types/order";

let passwordSchema = z.string();

passwordSchema = passwordSchema.min(PASSWORD_POLICY.minLength, {
  message: `Password must be at least ${PASSWORD_POLICY.minLength} characters`,
});

if (PASSWORD_POLICY.requireNumber) {
  passwordSchema = passwordSchema.regex(/\d/, {
    message: "Password must include at least one number",
  });
}

if (PASSWORD_POLICY.requireUppercase) {
  passwordSchema = passwordSchema.regex(/[A-Z]/, {
    message: "Password must include at least one uppercase letter",
  });
}

export const signInSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please provide a valid email" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const productFormSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  price: z.coerce.number().min(0),
  size: z.string().min(1),
  material: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  category: z.string().min(1),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  description: z.string().optional(),
  discountPct: z.coerce.number().min(0).max(90).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
});

const stringOrStringArray = z.union([z.string(), z.array(z.string())]);

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: stringOrStringArray.optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  material: stringOrStringArray.optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export const cartUpdateSchema = z.object({
  productId: z.string(),
  qty: z.coerce.number().min(1),
});

export const promotionSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(3).transform((value) => value.toUpperCase()),
  discountPct: z.coerce.number().min(0).max(90).optional(),
  discountAmt: z.coerce.number().min(0).optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  active: z.boolean(),
});

export const orderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(ORDER_STATUSES),
  note: z.string().optional(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10),
});
