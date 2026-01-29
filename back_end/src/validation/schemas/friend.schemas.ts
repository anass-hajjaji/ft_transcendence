import { z } from 'zod';

const userIdSchema = z.number()
    .int("User ID must be an integer")
    .positive("User ID must be positive");

export const FriendRequestSchema = z.object({
    receiverID: userIdSchema
});

export const AcceptFriendSchema = z.object({
    senderID: userIdSchema
});

export const RejectFriendSchema = z.object({
    otherUserID: userIdSchema
});

export const RemoveFriendSchema = z.object({
    friendID: userIdSchema
});

export const GetFriendStatusQuerySchema = z.object({
    profileID: z.coerce.number()
        .int("Profile ID must be an integer")
        .positive("Profile ID must be positive")
});


export const FriendsUserIdParamSchema = z.object({
    userID: z.coerce.number()
        .int("User ID must be an integer")
        .positive("User ID must be positive")
});
