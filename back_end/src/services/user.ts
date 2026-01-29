
import bcrypt from "bcryptjs";
import { createUserModel, deleteUserModel, getAllUsersModel, getUserById, updateUserModel } from "../models/user";
import { getFriendsByUserId } from '../models/user';


 export function validemail(email: string): boolean{
    const emailExpression= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailExpression.test(email);
}
const userService = {
    createUser: async (data: { fullName: string; username: string; email: string; password: string }) => {
        if(!data.fullName)
            return { status: 400, result:{ error: "Fullname is required"}}
        if(!data.username)
            return {status: 400, result: { error: "Username is required"}};
    if(!data.email)
        return {status: 400, result: { error: "Email is required"}};
    if(!validemail(data.email))
        return {status: 400, result: { error: "Invalid email format"}};

    if(!data.password)
            return{ status: 400, result: { error: "Password is required"}};
        const hashMax = 10;
        const hashPass = await bcrypt.hash(data.password, hashMax);
        const newUser: {
            [key: string]: unknown;
            password?: string;
        } = await createUserModel({
            ...data,
            password: hashPass,
        });
        if (!newUser) {
            return { status: 400, result: { error: "Error creating user" } };
        }
        delete newUser.password;
       return {
        ...newUser
       };
    },
    getUserById: async (id: number) => {    
        const user = await getUserById(id);
        if(!user)
            throw new Error("User not found");
        delete user.password;
        return user;
    },
    getAllUsers: async () => {
        const users = await getAllUsersModel();
        return users;
    },
    updateUser: async (id: number, data: Record<string, unknown>) => {
        const updatedUser = await updateUserModel(id, data);
        return updatedUser;
    },
    
    deleteUser: async (id: number) => {
        await deleteUserModel(id);
    },

    getUserFriends: async (id: number) => {
        return await getFriendsByUserId(id);
      },
};

export default userService;
