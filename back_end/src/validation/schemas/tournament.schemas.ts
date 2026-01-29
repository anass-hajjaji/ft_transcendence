import { z } from 'zod';

export const CreateTournamentSchema = z.object({
    players: z.array(z.string().min(1, "Player name cannot be empty"))
        .min(2, "Tournament requires at least 2 players")
        .max(8, "Tournament cannot have more than 8 players")
        .refine(
            (players) => new Set(players).size === players.length,
            { message: "Duplicate player names are not allowed" }
        )
});

export const UpdateTournamentSchema = z.object({
    winner: z.string().min(1, "Winner name is required")
});

export const TournamentIdParamSchema = z.object({
    id: z.coerce.number()
        .int("Tournament ID must be an integer")
        .positive("Tournament ID must be positive")
});
