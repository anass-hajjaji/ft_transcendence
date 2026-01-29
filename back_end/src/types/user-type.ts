
interface UserType {
    id_user?: number;
    username: string;
    fullName: string;
    alias_name?: string;
    password?: string;
    email: string;
    avatar?: string;
    "2FA"?: number;
    status?: string;
    wins?: number;
    losses?: number;
    createdAt?: string;
    date?: string;
}

export type { UserType };

import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number };
    user: { id: number };

    refresh: {
      sign: (payload: object, options?: import("jsonwebtoken").SignOptions) => string;
      verify: (token: string) => { id: number; iat?: number; exp?: number };
    };
  }
}