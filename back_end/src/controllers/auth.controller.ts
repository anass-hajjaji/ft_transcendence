import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import authService from "../services/auth.service";

type  tokenResponse = {
    access_token: string;
    refresh_token: string;
};
const authController = {
    signUp: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result } = await authService.signUp(
                request.body as { fullName: string; username: string; email: string; password: string }
            );
            reply.status(status).send(result);
        } catch (error: unknown) {
            reply.status(400).send({  error });
        }
    },

    signIn: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result }:{status: number, result: {token?: tokenResponse }} = await authService.signIn(
                request.body as { email: string; password: string }
            );

            const access_token = result?.token?.access_token;
            const refresh_token = result?.token?.refresh_token;

            if (access_token && refresh_token) {
                reply.setCookie("access_token", access_token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60,
                });

                reply.setCookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 7 * 24 * 60 * 60,
                });
            }

            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    refresh: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result } = await authService.refresh(request, reply);
            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    me: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = request?.user?.id;
            const { status, result } = await authService.me(userId);
            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    signOut: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result } = await authService.signOut(request, reply);
            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    forgotPassword: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result } = await authService.forgotPassword(request.body as {
        token: string, password: string , confirmPassword: string});
            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    declareForgotPassword: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result } = await authService.declareForgotPassword(
                (request?.body as { email: string })?.email as string
            );
            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },

    signIn2FA: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result }:{
                status: number, result: { token: tokenResponse,user: unknown } | unknown
            } = await authService.signIn2FA(request.body as { userId: number; code: string });

            const access_token = (result as { token: tokenResponse }).token.access_token;
            const refresh_token = (result as { token: tokenResponse }).token.refresh_token;
            reply.setCookie("access_token", access_token, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60,
                path: "/",
            });
            reply.setCookie("refresh_token", refresh_token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            });

            reply.status(status).send(result);
        }
        catch (error) {
            reply.status(400).send({ error });
        }
    },

    updateAccount: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userID = request.user.id;
            const { username, fullName, email } = request.body as { username: string; fullName: string; email: string; };
            const result = await authService.updateAccount({ id: userID, username, fullName, email });

            if (result.status !== 200) {
                return reply.status(result.status).send(result.result);
            }

            reply.status(200).send(result.result);
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    googleSignIn: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, result }: { status: number, result: { token: tokenResponse,user: unknown } | unknown } = await authService.googleSignIn(
                request.body as {
                    email: string;
                    name: string;
                    avatar: string | null;
                }
            );

            const access_token = (result as { token: tokenResponse }).token?.access_token;
            const refresh_token = (result as { token: tokenResponse }).token?.refresh_token;

            if (access_token && refresh_token) {
                reply.setCookie("access_token", access_token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 60 * 60,
                    path: "/",
                });

                reply.setCookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60,
                    path: "/",
                });
            }

            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    },
    changePassword: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userID = request.user.id;
            const { currentPassword, newPassword, confirmNewPassword } = request.body as { currentPassword: string; newPassword: string; confirmNewPassword: string; };
            const result = await authService.changePassword({ currentPassword, newPassword, confirmNewPassword, id: userID });

            if (result.status !== 200) {
                return reply.status(result.status).send(result.result);
            }

            reply.status(200).send(result.result);
        } catch (error) {
            reply.status(400).send({ error: (error as Error).message });
        }
    },

    intraSignIn: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { code } = request.body as { code: string };
            const { status, result } = await authService.intraSignIn({ code });

            const access_token = (result as { token: tokenResponse }).token?.access_token;
            const refresh_token = (result as { token: tokenResponse }).token?.refresh_token;

            if (access_token && refresh_token) {
                reply.setCookie("access_token", access_token, {
                    httpOnly: false,
                    secure: false, 
                    sameSite: "lax",
                    maxAge: 60 * 60,
                    path: "/",
                });

                reply.setCookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    secure: false, 
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60,
                    path: "/",
                });
            }

            reply.status(status).send(result);
        } catch (error) {
            reply.status(400).send({ error });
        }
    }
};

export default authController;