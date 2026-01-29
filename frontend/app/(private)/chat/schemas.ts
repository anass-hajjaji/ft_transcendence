import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 500; 
export const MESSAGE_MIN_LENGTH = 1;   
export const USERNAME_MAX_LENGTH = 20;  


export const MessageTypeSchema = z.enum(['text', 'game_invite', 'system']);

export const ReceiveMessageSchema = z.object({
  id: z.number().optional(),
  text: z.string()
    .min(MESSAGE_MIN_LENGTH, "Message cannot be empty")
    .max(MESSAGE_MAX_LENGTH, `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`),
  sender: z.string()
    .min(1, "Sender is required")
    .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`),
  type: MessageTypeSchema.optional().default('text'),
});


export const HistoryMessageSchema = z.object({
  text: z.string()
    .min(MESSAGE_MIN_LENGTH)
    .max(MESSAGE_MAX_LENGTH),
  sender: z.string()
    .min(1)
    .max(USERNAME_MAX_LENGTH),
  type: MessageTypeSchema.optional(),
  created_date: z.string(),
});

export const OutgoingMessageSchema = z.object({
  text: z.string()
    .min(MESSAGE_MIN_LENGTH, "Message cannot be empty")
    .max(MESSAGE_MAX_LENGTH, `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`)
    .trim(),
  type: MessageTypeSchema.default('text'),
});

export const PartnerStatusSchema = z.enum(['online', 'offline']);

export const RoomDataPayloadSchema = z.object({
  history: z.array(HistoryMessageSchema),
  iBlockedThem: z.boolean(),
  theyBlockedMe: z.boolean(),
  partnerStatus: PartnerStatusSchema,
});


export const TypingEventSchema = z.object({
  isTyping: z.boolean(),
});


export const UserStatusEventSchema = z.object({
  username: z.string(),
});


export const OnlineUsersEventSchema = z.object({
  users: z.array(z.string()).optional().default([]),
});


export const GameInviteReceivedSchema = z.object({
  from: z.string()
    .min(1, "Sender username is required")
    .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`),
  roomId: z.string()
    .min(1, "Room ID is required"),
  mapType: z.string().default('default'), 
  timestamp: z.number().optional(),
});

export const GameInviteAcceptedSchema = z.object({
  from: z.string().min(1).max(USERNAME_MAX_LENGTH).optional(),
  roomId: z.string().min(1),
  mapType: z.string().default('default'),
});

export const GameInviteRejectedSchema = z.object({
  from: z.string().min(1).max(USERNAME_MAX_LENGTH),
});

export const GameInviteCancelledSchema = z.object({
  from: z.string().min(1).max(USERNAME_MAX_LENGTH),
});

export const GameInviteExpiredSchema = z.object({
  from: z.string().min(1).max(USERNAME_MAX_LENGTH),
});

export const SendGameInviteSchema = z.object({
  to: z.string()
    .min(1, "Recipient username is required")
    .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`),
  mapType: z.string().default('default'), 
});

export const UnreadCountsSchema = z.object({
  counts: z.record(z.string(), z.number()),
});

export const LastMessageTimesSchema = z.object({
  times: z.record(z.string(), z.number()),
});

// Export types
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type ReceiveMessage = z.infer<typeof ReceiveMessageSchema>;
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;
export type PartnerStatus = z.infer<typeof PartnerStatusSchema>;
export type RoomDataPayload = z.infer<typeof RoomDataPayloadSchema>;
export type TypingEvent = z.infer<typeof TypingEventSchema>;
export type UserStatusEvent = z.infer<typeof UserStatusEventSchema>;
export type OnlineUsersEvent = z.infer<typeof OnlineUsersEventSchema>;
export type GameInviteReceived = z.infer<typeof GameInviteReceivedSchema>;
export type GameInviteAccepted = z.infer<typeof GameInviteAcceptedSchema>;
export type GameInviteRejected = z.infer<typeof GameInviteRejectedSchema>;
export type GameInviteCancelled = z.infer<typeof GameInviteCancelledSchema>;
export type GameInviteExpired = z.infer<typeof GameInviteExpiredSchema>;
export type SendGameInvite = z.infer<typeof SendGameInviteSchema>;
export type UnreadCounts = z.infer<typeof UnreadCountsSchema>;
export type LastMessageTimes = z.infer<typeof LastMessageTimesSchema>;

export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  eventName: string
): T | undefined {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.log(`❌ Zod validation failed for "${eventName}":`, result.error.format());
    return undefined;
  }
  
  return result.data;
}

