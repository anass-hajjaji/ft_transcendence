import { z } from 'zod';

export const SetAvatarSchema = z.object({
    avatarUrl: z.string()
        .min(1, "Avatar URL is required")
        .max(500, "Avatar URL too long")
});

export const DeleteAvatarSchema = z.object({
    avatarUrl: z.string()
        .min(1, "Avatar URL is required")
        .optional()
});


