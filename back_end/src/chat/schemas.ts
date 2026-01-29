import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 500;
export const MESSAGE_MIN_LENGTH = 1;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_MIN_LENGTH = 1;

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

const UsernameSchema = z.string()
  .min(USERNAME_MIN_LENGTH, "Username required")
  .max(USERNAME_MAX_LENGTH, "Username too long (max 20 chars)")
  .regex(usernameRegex, "Username can only contain letters, numbers, and underscores");

export const MessageTypeSchema = z.enum(['text', 'game_invite', 'system']);

export const JoinPrivateChatSchema = z.object({
  me: UsernameSchema,
  other: UsernameSchema,
});
export const SendMessageSchema = z.object({
  sender: UsernameSchema,
  target: UsernameSchema,
  text: z.string()
    .min(MESSAGE_MIN_LENGTH, "Message cannot be empty")
    .max(MESSAGE_MAX_LENGTH, `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`)
    .trim(), // Remove whitespace
  type: MessageTypeSchema.optional().default('text'),
});
export const BlockUserSchema = z.object({
  me: UsernameSchema,
  target: UsernameSchema,
});
export const TypingEventSchema = z.object({
  from: UsernameSchema,
  to: UsernameSchema,
});
export const SendGameEnvite = z.object(
  {
    to: UsernameSchema,
    roomId: z.string().min(1, "Room ID is required"),
    mapType: z.string().default('default')
  });
export const AcceptGameInvite = z.object(
  {
    from: UsernameSchema,
    roomId: z.string().min(1, "Room ID is required"),
    mapType: z.string().default('default')
  }
);
export const RejectGameInvite = z.object({
  from: UsernameSchema,
});

export const CancelGameInvite = z.object({
  to: UsernameSchema,
});
export const ExpireGameInvite = z.object({
  to: UsernameSchema,
});
export const GetUnreadCountsSchema = z.object({
  me: UsernameSchema,
  friends: z.array(UsernameSchema),
});
export const GetLastMessageTimesSchema = z.object({
  me: UsernameSchema,
  friends: z.array(UsernameSchema),
});

export type MessageType = z.infer<typeof MessageTypeSchema>;
export type JoinPrivateChat = z.infer<typeof JoinPrivateChatSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type BlockUser = z.infer<typeof BlockUserSchema>;
export type TypingEvent = z.infer<typeof TypingEventSchema>;
export type SendGameInvite = z.infer<typeof SendGameEnvite>;
export type AcceptInvite = z.infer<typeof AcceptGameInvite>;
export type RejectInvite = z.infer<typeof RejectGameInvite>;
export type CancelInvite = z.infer<typeof CancelGameInvite>;
export type ExpireInvite = z.infer<typeof ExpireGameInvite>;
export type GetUnreadCounts = z.infer<typeof GetUnreadCountsSchema>;
export type GetLastMessageTimes = z.infer<typeof GetLastMessageTimesSchema>;


export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  eventName: string
): T | false {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Zod validation failed for "${eventName}":`, result.error.format());
    return false;
  }
  return result.data; 
}