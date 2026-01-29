import { z } from 'zod';

export const GetStatsQuerySchema = z.object({
    username: z.string()
        .min(1, "Username is required")
        .trim(),
    limit: z.string()
        .optional()
        .refine(
            (val) => !val || val === "all" || !isNaN(parseInt(val, 10)),
            "Limit must be 'all' or a valid number"
        ),
    game_type: z.enum(["pong", "tic-tac-toe"])
        .optional()
        .describe("Filter stats by game type")
});
