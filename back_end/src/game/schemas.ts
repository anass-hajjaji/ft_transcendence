
import { z } from 'zod';

export const JoinQueueSchema = z.object({
    mapType: z.string().optional().default('default'),
});


export const JoinPrivateGameSchema = z.union([
    z.string().min(1, "Room ID cannot be empty"),
    z.object({
        roomId: z.string().min(1, "Room ID cannot be empty"),
        mapType: z.string().optional().default('default'),
    }),
]).transform((val) => {
    if (typeof val === 'string') {
        return { roomId: val, mapType: 'default' };
    }
    return { roomId: val.roomId, mapType: val.mapType || 'default' };
});

export const GameInputSchema = z.enum(['up', 'down', 'stop']);

export function safeParse<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    eventName: string
): T | false {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error(`❌ Pong Validation failed for "${eventName}":`, result.error.format());
        return false;
    }
    return result.data;
}


export type JoinQueuePayload = z.infer<typeof JoinQueueSchema>;
export type JoinPrivateGamePayload = z.infer<typeof JoinPrivateGameSchema>;
export type GameInputPayload = z.infer<typeof GameInputSchema>;
