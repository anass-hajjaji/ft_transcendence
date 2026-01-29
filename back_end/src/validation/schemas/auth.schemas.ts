import { z } from 'zod';

const strongPasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");


const emailSchema = z.string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long");

const usernameSchema = z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .trim();

export const SignInSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .trim(),
    password: z.string()
        .min(1, "Password is required")
});

export const SignUpSchema = z.object({
    email: emailSchema,
    username: usernameSchema,
    fullName: z.string()
        .min(1, "Full name is required")
        .max(100, "Full name too long")
        .trim(),
    password: strongPasswordSchema
});

export const ForgotPasswordSchema = z.object({
    email: emailSchema
});

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const Verify2FASchema = z.object({
    userId: z.number().int().positive("User ID is required"),
    code: z.string()
        .length(6, "2FA code must be exactly 6 digits")
        .regex(/^\d+$/, "2FA code must contain only numbers")
});

export const GoogleAuthSchema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(1, "Name is required"),
    avatar: z.string().nullable().optional()
});

export const IntraAuthSchema = z.object({
    code: z.string().min(1, "Authorization code is required")
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmNewPassword: z.string().min(1, "Password confirmation is required")
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"]
});

export const UpdateAccountSchema = z.object({
    fullName: z.string()
        .min(1, "Full name is required")
        .max(100, "Full name too long")
        .trim()
        .optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional()
});
