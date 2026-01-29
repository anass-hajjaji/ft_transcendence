import { createUserModel, getUserByemail, getUserById, updatePasswordEmail, updateUserModel } from "../models/user";
import bcrypt from "bcryptjs";
import { validemail } from "./user";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import redis from "../db/redis";
import { randomKey } from "../utils/function";
import { authenticator } from "otplib";
import { connectDB } from "../db";
import axios from "axios";
import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";

export const generate_token_acces = (userId: number) => {
    return jwt.sign({id: userId},
    process.env.JWT_SECRET || "secret", 
    {expiresIn: process.env.JWT_EXPIRES || "1h"} as jwt.SignOptions
    );
};


export const generate_token_refresh = (userId: number) => {
    return jwt.sign({id: userId}, 
    process.env.JWT_REFRESH_SECRET || "refresh_secret", 
    {expiresIn: process.env.JWT_REFRESH || "7d"} as jwt.SignOptions
    );
};


const userService = {

    signIn: async (data: { email: string; password: string }) => {
        if(!data.email || !data.password)
        {return{ status: 400, result: { error: "Password and email is required"}};}
        if(!validemail(data.email))
        {return{ status: 400, result: { error: "Invalid email format"}};}
        const user = await getUserByemail(data.email)
        if(!user)
        {
            return { status:400, result: { error: "User not found"}};
        }
        const verifcator =  await bcrypt.compare(data.password, user.password)
        if(!verifcator)
        {
            return { status:400, result: {error: "Invalid Password"}};
        }

        if(user.twofa_enabled)
        {
            return {
                status: 200,
                result: {
                   message: "2FA required",
                   twofa_enabled: true,
                   userId: user.id_user,
                },
            };
        }
        const token = generate_token_acces(user.id_user);
        const token_refresh = generate_token_refresh(user.id_user);
         await updateUserModel(user.id_user, { status: 'online' });
        return {
            status: 200,
            result: {

               user,
               token:{
                access_token: token,
                refresh_token: token_refresh,
               }
            },
        };
    },
    signUp: async (data: {fullName: string; username: string; email: string; password: string }) => {
        try{

         if(!data.email || !data.password || !data.username || !data.fullName)
        {return{ status: 400, result: { error: "All is required"}};}
          if(!validemail(data.email))
        {return{ status: 400, result: { error: "Invalid email format"}};}

        const hash = await bcrypt.hash(data.password, 10);
        const newUser = await createUserModel({
            ...data,
            password: hash,
        });
        if (!newUser) {
            return { status: 400, result: { error: "Error creating user" } };
        }
         return {status:200, result:{ message: "signUp successful" }};
        } catch (err) {
            const error = err as { code?: string; message?: string };
            if (error.code === 'ER_DUP_ENTRY') {
                return { status: 400, result: { error: "Email or Username already exists" } };
            }
            return { status: 400, result: { error: error.message || "Error signUp" } };
        }
},


    getUserById: async (id: number) => {
            const user = await getUserById(id);
            if(!user)
                return{ status: 400, result: { error: "User not found"}};

            return{ status: 200, result: {...user}};
        },


    refresh: async (request: FastifyRequest, reply: FastifyReply) => {
    try{
      const  refreshToken = request.cookies.refresh_token;
      if(!refreshToken){
      return reply.status(400).send({error: "Missing token"});
      }
    const decod = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {id: number};
    const newAccess = jwt.sign({id: decod.id}, process.env.JWT_SECRET as string, {expiresIn: process.env.JWT_EXPIRES || "1h"} as jwt.SignOptions);
    reply.setCookie("access_token", newAccess, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, 
    });
    return { status: 200, result: { message: "Token is refreshed", accessToken: newAccess } };

      }
    catch (error) {
              return { status: 401, result: { error: "Invalid refresh token" } };
    }
    },
    me: async (userId: number) => {
        if (!userId) {
            return { status: 400, result: { error: "User ID is required" } };
        }
        const user = await getUserById(userId);
        
        if(!user)
            return{ status: 400, result: { error: "User not found"}};

        return{ status: 200, result: {...user}};
    },


   signOut: async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (request.user?.id) {
      await updateUserModel(request.user.id, { status: "offline" });
    }

    reply
      .clearCookie("access_token", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .clearCookie("refresh_token", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,

      });
   return { status: 200, result: { message: "Sign out successful" } };

  } catch (error) {
    return { status: 400, result: { message: (error as Error).message || "Error signOut" } };
  }
},
    declareForgotPassword: async (email: string) => {
        try{
            const user = await getUserByemail(email);
            if(!user)
                throw new Error("User not found");
        const key = randomKey(8);
        await redis.set(`forgot_password_${key}`, user.email, "EX", 300);
                const transporter =await  nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD,
                },
                });

            await transporter.sendMail({
            from: `"Support" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <div style="margin: 20px 0;">
                your reset code is :</div>
                <b>${key}</b>
                <p>This link will expire in 5 minutes.</p>
            `,
            })

    return { status: 200, result: "Email sent successfully" };

  } catch (error) {
    return { status: 400, result: error || "Error forgot password" };
  }
},

    forgotPassword: async (data: {
        token: string, password: string , confirmPassword: string}) => {
            try{
            const {password,token,confirmPassword} = data;
            const email = await redis.get(`forgot_password_${token}`);
            if(!email)
                return{status: 400, result:( "Invalid or expired token" )};
            if(password != confirmPassword)
                return{status: 400, result:( "Incorrect Password" )};
                
                const hash = await bcrypt.hash(password, 10);

                 await updatePasswordEmail(email, hash);
                 await redis.del(`forgot_password_${token}`);
                return {status: 200, result: ("Update succes")};
} catch (error) {
    return { status: 400, result: error || "Error reset password" };
    }
    },

signIn2FA: async (data: { userId: number; code: string }): Promise<{ status: number; result: {
    user: unknown; token: { access_token: string; refresh_token: string}  
}  | string | unknown}> => {
    try {
        console .log("2FA sign-in data received:", data);
        const user = await getUserById(data.userId);
        if (!user) {
            return { status: 404, result: "User not found" };
        }
       const isValid = authenticator.check(data.code, user.twofa_secret);
       if(!isValid){
        return { status: 400, result: "Invalid 2FA code" };
       }
        const access_token = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
        const refresh_token = jwt.sign({ id: user.id_user }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });

        await updateUserModel(data.userId, { status: 'online' });

        return {
            status: 200,
            result: {
                user,
                token: {
                    
                    access_token,
                    refresh_token
                }
            }
        }
    } catch (error) {
        return { status: 400, result: error || "Error during 2FA sign-in" };
    }
},

updateAccount: async (data: {id : number, fullName: string; username: string; email: string}) =>
    {
        if(!data.fullName || !data.username || !data.email)
                {return{ status: 400, result: { error: "All is required"}};}
        if(!validemail(data.email))
                {return{ status: 400, result: { error: "Invalid email"}};}
    
        const db = await connectDB();
        const result = await db.run(
          `UPDATE users SET username = ?, fullName = ?, email = ? WHERE id_user = ?`,
          [data.username, data.fullName, data.email, data.id]
        );
    
      return {
        status: 200,
        result: {
        message: "Account updated successfully",
      ...result
        },
        };
    },


changePassword: async (data: {currentPassword: string; newPassword: string; confirmNewPassword: string, id: number}) =>
{
    if(!data.currentPassword || !data.newPassword || !data.confirmNewPassword)
            {return{ status: 400, result: { error: "All is required"}};}
    if(data.newPassword !== data.confirmNewPassword)
            {return{ status: 400, result: { error: "New passwords do not match"}};}
    if(data.newPassword.length < 6)
            {return{ status: 400, result: { error: "New password least 6 characters"}};}


    const db = await connectDB();
    
    const user = await db.get(`SELECT * FROM users WHERE id_user = ?`,
      [data.id]);
    
    const hashedPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!hashedPassword) {
      return { status: 400, result: { error: "Current password is incorrect" } };
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

    await db.run(
      `UPDATE users SET password = ? WHERE id_user = ?`,
      [hashedNewPassword, data.id]
    );

      return {
      status: 200,
      result: {
      message: "Password changed successfully",
      },
      };
},
  googleSignIn: async (data: {
    email: string;
    name: string;
    avatar: string | null;
  }) => {
    try {
      let user = await getUserByemail(data.email);

      if (!user) {
        user = await createUserModel({
          fullName: data.name,
          username: data.name.replace(/\s+/g, '').toLowerCase(),
          email: data.email,
          password: randomKey(12),
          avatar: data.avatar || undefined,
        });
      }
      if (user?.twofa_enabled){
          return {
            status: 200,
            result: {
               message: "2FA required",
               twofa_enabled: true,
               userId: user.id_user,
            },
        }
      }
      const token = generate_token_acces(user.id_user);
      const token_refresh = generate_token_refresh(user.id_user);
       await updateUserModel(user.id_user, { status: 'online' });

      return {
        status: 200,
        result: {
           user,
           token:{
            access_token: token,
            refresh_token: token_refresh,
           }
        },
      }
    } catch (error) {
      return {
        status: 400,
        result: {
          error: (error as Error).message || "Error Google Sign-In",
        },
      };
    }
  },

  intraSignIn: async (data: { code: string }) => {
    try {
		const tokenUrl = process.env.FT_API_TOKEN_URL!;
      const tokenResponse = await axios.post(tokenUrl, {
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID_42,
        client_secret: process.env.CLIENT_SECRET_42,
        code: data.code,
        redirect_uri: process.env.REDIRECT_URI_42,
      });

	  const meUrl = process.env.FT_API_ME_URL!
      const accessToken = tokenResponse.data.access_token;

      const userResponse = await axios.get(meUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const intraUser = userResponse.data;
      const email = intraUser.email;

      let user = await getUserByemail(email);

      if (!user) {
        user = await createUserModel({
          fullName: `${intraUser.first_name} ${intraUser.last_name}`,
          username: intraUser.login,
          email: email,
          password: randomKey(12),
          avatar: intraUser.image?.link || undefined,
        });
      }

      if (user?.twofa_enabled) {
        return {
          status: 200,
          result: {
            message: "2FA required",
            twofa_enabled: true,
            userId: user.id_user,
          },
        };
      }

      const token = generate_token_acces(user.id_user);
      const token_refresh = generate_token_refresh(user.id_user);

      await updateUserModel(user.id_user, { status: 'online' });

      return {
        status: 200,
        result: {
          user,
          token: {
            access_token: token,
            refresh_token: token_refresh,
          }
        },
      };
    } catch {

      return {
        status: 400,
        result: { error: "Error during Intra Sign-In" },
      };
    }
  },

}

export default userService;