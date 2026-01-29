import { z } from 'zod';

export const SearchUserQuerySchema = z.object({
    q: z.string()
        .min(1, "Search query cannot be empty")
        .max(50, "Search query too long")
        .trim()
});

export const UserIdParamSchema = z.object({
    id: z.coerce.number()
        .int("User ID must be an integer")
        .positive("User ID must be positive")
});
