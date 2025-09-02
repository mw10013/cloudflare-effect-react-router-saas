import * as z from "zod";

/**
 * Domain schemas and inferred types for the application.
 * Each Zod schema is exported in PascalCase, followed by its inferred type with the same name.
 * Schemas must align with corresponding database tables.
 *
 *
 */

export const UserRole = z.enum(["user", "admin"]); // MUST align with UserRole table.
export type UserRole = z.infer<typeof UserRole>;

export const MemberRole = z.enum(["member", "owner", "admin"]); // MUST align with MemberRole table.
export type MemberRole = z.infer<typeof MemberRole>;

export const InvitationStatus = z.enum([
  "pending",
  "accepted",
  "rejected",
  "canceled",
]); // MUST align with InvitationStatus table.
export type InvitationStatus = z.infer<typeof InvitationStatus>;

export const User = z.object({
  userId: z.number().int(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.number().int(),
  image: z.string().nullable(),
  role: UserRole,
  banned: z.number().int(),
  banReason: z.string().nullable(),
  banExpires: z.iso.datetime().nullable(),
  stripeCustomerId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type User = z.infer<typeof User>;
