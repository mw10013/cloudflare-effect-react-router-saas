import * as z from "zod";

export const UserRole = z.enum(["user", "admin"]); // MUST align with UserRole table.

export const MemberRole = z.enum(["member", "owner", "admin"]); // MUST align with MemberRole table.

export const InvitationStatus = z.enum(["pending", "accepted", "rejected", "canceled"]); // MUST align with InvitationStatus table.
