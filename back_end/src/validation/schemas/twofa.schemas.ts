import { z } from 'zod';

const twoFACodeSchema = z.string()
    .length(6, "2FA code must be exactly 6 digits")
    .regex(/^\d+$/, "2FA code must contain only numbers");

export const Setup2FASchema = z.object({
    userId: z.number().int().positive().optional()
});


export const Enable2FASchema = z.object({
    code: twoFACodeSchema
});

export const Disable2FASchema = z.object({
    code: twoFACodeSchema,
    userId: z.number().int().positive().optional()
});
