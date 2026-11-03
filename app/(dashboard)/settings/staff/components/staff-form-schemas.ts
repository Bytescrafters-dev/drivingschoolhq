import { z } from "zod";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api/error-messages";
import { normalizeNic } from "@/lib/nic";
import { normalizeLkPhone } from "@/lib/phone";

// Field rules from the staff plan (§3.2). The backend re-validates everything.

export const staffDetailsShape = {
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(200, "Full name must be at most 200 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email must be at most 254 characters")
    .pipe(z.email("Enter a valid email")),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || normalizeLkPhone(v) !== null, {
      message: "Enter a Sri Lankan number, e.g. 077 123 4567",
    }),
  nic: z
    .string()
    .trim()
    .refine((v) => v === "" || normalizeNic(v) !== null, {
      message: "Enter 9 digits with V or X, or 12 digits",
    }),
};

export type StaffDetailsValues = {
  fullName: string;
  email: string;
  phone: string;
  nic: string;
};

export const temporaryPasswordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(128, "Use at most 128 characters");

export const branchAccessShape = {
  branchAccess: z.enum(["ALL", "SELECTED"]),
  branchIds: z.array(z.string()),
  defaultBranchId: z.string(),
};

export type BranchAccessValues = {
  branchAccess: "ALL" | "SELECTED";
  branchIds: string[];
  defaultBranchId: string;
};

/** SELECTED needs ≥ 1 branch and a default among them; ALL needs a default. */
export const refineBranchAccess = (
  value: BranchAccessValues,
  ctx: z.RefinementCtx,
) => {
  if (value.branchAccess === "SELECTED" && value.branchIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["branchIds"],
      message: "Choose at least one branch",
    });
  }
  if (
    !value.defaultBranchId ||
    (value.branchAccess === "SELECTED" &&
      !value.branchIds.includes(value.defaultBranchId))
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["defaultBranchId"],
      message: "Choose a default branch",
    });
  }
};

/** Form value → API value: "" clears (null), otherwise normalised. */
export const phoneOrNull = (v: string) =>
  v.trim() ? (normalizeLkPhone(v) ?? v.trim()) : null;
export const nicOrNull = (v: string) =>
  v.trim() ? (normalizeNic(v) ?? v.trim()) : null;

const FIELD_BY_CODE: Record<string, string> = {
  TENANT_USER_EMAIL_TAKEN: "email",
  TENANT_USER_NIC_TAKEN: "nic",
  INVALID_NIC: "nic",
  INVALID_PHONE: "phone",
  PHONE_REQUIRED: "phone",
  BRANCH_SELECTION_INVALID: "branchIds",
};

/**
 * Maps a backend error to one of the form's fields, when it belongs to one.
 * `fields` lists the fields this form actually has.
 */
export const staffFieldError = <F extends string>(
  error: unknown,
  fields: readonly F[],
): { field: F; message: string } | null => {
  const code = getApiErrorCode(error);
  const field = code ? FIELD_BY_CODE[code] : undefined;
  if (!field || !(fields as readonly string[]).includes(field)) return null;
  return { field: field as F, message: getApiErrorMessage(error) ?? "" };
};
