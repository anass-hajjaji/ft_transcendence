
import { FastifyInstance } from "fastify";
import FriendController from "../controllers/friend.controller";
import {
    validate,
    validateQuery,
    validateParams,
    FriendRequestSchema,
    AcceptFriendSchema,
    RejectFriendSchema,
    RemoveFriendSchema,
    GetFriendStatusQuerySchema,
    FriendsUserIdParamSchema
} from "../validation";


const friendRoute = async (app: FastifyInstance) => {
    app.post("/request", { preHandler: validate(FriendRequestSchema) }, FriendController.sendFriendRequest);

    app.post("/accept", { preHandler: validate(AcceptFriendSchema) }, FriendController.acceptFriendRequest);

    app.post("/remove", { preHandler: validate(RemoveFriendSchema) }, FriendController.removeFriend);

    app.get("/status", { preHandler: validateQuery(GetFriendStatusQuerySchema) }, FriendController.getFriendStatus);
    app.get("/pending", FriendController.getPendingRequests);
    app.post("/reject", { preHandler: validate(RejectFriendSchema) }, FriendController.rejectFriendRequest);

    app.get("/:userID", { preHandler: validateParams(FriendsUserIdParamSchema) }, FriendController.getFriendsList);

};

export default friendRoute;