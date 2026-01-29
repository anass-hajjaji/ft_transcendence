import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

import { sendRequest, acceptRequest, getFriendsList, removeFriend, friendStatus, getPendingRequests, rejectRequest } from "../services/friends.service";
import { getUserById } from "../models/user";

export const FriendController = {

    sendFriendRequest: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const senderID = request.user.id;
            const { receiverID } = request.body as { receiverID: number };
            await sendRequest(senderID, receiverID);
            reply.status(200).send({ message: "Friend request sent" });
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    acceptFriendRequest: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const receiverID = request.user.id;
            const { senderID } = request.body as { senderID: number };

            await acceptRequest(senderID, receiverID);
            reply.status(200).send({ message: "Friend request accepted" });
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    removeFriend: async (request: FastifyRequest, reply: FastifyReply) => {

        try {
            const userID = request.user.id;
            const { friendID } = request.body as { friendID: number };

            await removeFriend(userID, friendID);
            reply.status(200).send({ message: "Friend removed" });
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }

    },

    getFriendsList: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userID = request.user.id;
            const friendsList = await getFriendsList(Number(userID));

            const friendsWithData = await Promise.all(
                friendsList.map(async (f: { friendID: number }) => {
                    const friendUser = await getUserById(f.friendID);
                    return friendUser;
                })
            );

            const friends = friendsWithData.filter(friend => friend !== null);

            reply.status(200).send(friends);
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    getFriendStatus: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userID = request.user.id;
            const profileID = Number((request.query as { profileID: string }).profileID);
            const status = await friendStatus(userID, profileID);
            reply.status(200).send(status);
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }

    },

    getPendingRequests: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!request.user || !request.user.id) {
                return reply.status(401).send({ error: "Unauthorized - no user found" });
            }
            const userID = request.user.id;
            const pending = await getPendingRequests(Number(userID));
            reply.status(200).send(pending);
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    rejectFriendRequest: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userID = request.user.id;
            const { otherUserID } = request.body as { otherUserID: number };
            await rejectRequest(userID, otherUserID);
            reply.status(200).send({ message: "Friend request cancelled/rejected" });

        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    }
};

export default FriendController;

