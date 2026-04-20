// ============================================================================
// 🛡️ INPUT VALIDATION SCHEMAS - Prevents crashes from bad data
// ============================================================================

import { z } from "zod";

// ============================================================================
// 💼 PROPERTY VALIDATION
// ============================================================================

export const propertySchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .transform(val => val.trim()),

  price: z.number()
    .positive("Price must be positive")
    .max(1000000000, "Price exceeds maximum allowed"),

  area: z.number()
    .positive("Area must be positive")
    .max(1000000, "Area exceeds maximum allowed"),

  type: z.string()
    .min(1, "Property type is required")
    .max(50, "Property type too long"),

  location: z.string()
    .min(3, "Location must be at least 3 characters")
    .max(500, "Location too long"),

  city: z.string()
    .max(100, "City name too long")
    .optional(),

  description: z.string()
    .max(5000, "Description too long")
    .optional(),

  vastu: z.enum(["east", "west", "north", "south", "north-east", "north-west", "south-east", "south-west"])
    .optional(),

  pincode: z.string()
    .regex(/^\d{6}$/, "Invalid pincode format")
    .optional(),

  latitude: z.number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),

  longitude: z.number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),

  sellerName: z.string()
    .max(100, "Name too long")
    .optional(),

  email: z.string()
    .email("Invalid email format")
    .max(255, "Email too long")
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// 📋 LEAD VALIDATION
// ============================================================================

export const leadSchema = z.object({
  toUserId: z.string()
    .min(1, "Recipient is required"),

  clientName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .transform(val => val.trim()),

  clientPhone: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

  pincode: z.string()
    .regex(/^\d{6}$/, "Invalid pincode"),

  propertyType: z.string()
    .max(50)
    .optional(),

  budget: z.string()
    .max(50)
    .optional(),

  message: z.string()
    .min(10, "Message too short")
    .max(1000, "Message too long"),
});

// ============================================================================
// 👤 USER AUTH VALIDATION
// ============================================================================

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .max(255, "Email too long")
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
});

export const signupSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .max(255, "Email too long")
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),

  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .transform(val => val.trim()),
});

// ============================================================================
// 🔍 SEARCH VALIDATION
// ============================================================================

export const searchSchema = z.object({
  query: z.string()
    .max(200, "Search query too long")
    .default(""),

  type: z.string()
    .max(50)
    .optional(),

  minPrice: z.number()
    .nonnegative()
    .optional(),

  maxPrice: z.number()
    .nonnegative()
    .optional(),

  minArea: z.number()
    .nonnegative()
    .optional(),

  maxArea: z.number()
    .nonnegative()
    .optional(),

  vastu: z.string()
    .optional(),

  page: z.number()
    .int()
    .positive()
    .default(1),

  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(25),
}).refine(data => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice, {
  message: "minPrice must be less than or equal to maxPrice",
  path: ["minPrice"],
}).refine(data => !data.minArea || !data.maxArea || data.minArea <= data.maxArea, {
  message: "minArea must be less than or equal to maxArea",
  path: ["minArea"],
});

// ============================================================================
// 🛠️ VALIDATION HELPERS
// ============================================================================

/**
 * Safely validate data against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(issue =>
    `${issue.path.join(".")}: ${issue.message}`
  );

  return { success: false, errors };
}

/**
 * Validate and throw on error (for cases where you want to crash)
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  return result.data;
}