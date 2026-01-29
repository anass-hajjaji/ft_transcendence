import { authenticator } from "otplib";
import { connectDB } from "../db";

import QRCode from "qrcode";


export async function setup2fa(userId: number) {

   const db = await connectDB();

   const secret = authenticator.generateSecret();

   const otpauth = authenticator.keyuri(
     `user${userId}`,
     "transcendence",
     secret
   );

   const qrcode = await QRCode.toDataURL(otpauth);

   await db.run(
     `UPDATE users SET twofa_secret = ? WHERE id_user = ?`,
     [secret, userId]
   );

   return { qrcode, secret };
}

export async function Enabled2faCode(userId: number, code: string) {

    const db = await connectDB();
    const user = await db.get(`SELECT twofa_secret FROM users WHERE id_user = ?`, [userId]);
    if (!user || !user.twofa_secret) {
      throw new Error("2FA not set up for this user");
    }
    
    const isValid = authenticator.check(code, user.twofa_secret);
    if (isValid) {
      await db.run(
        `UPDATE users SET twofa_enabled = 1 WHERE id_user = ?`,
        [userId]
      );
    }
    return isValid;
}


export async function desabled2fa(userId: number, code: string) {
    const db = await connectDB();
    const user = await db.get(`SELECT twofa_secret FROM users WHERE id_user = ?`, [userId]);
    if (!user || !user.twofa_secret) {
      throw new Error("2FA not set up for this user");
    }
    
    const isValid = authenticator.check(code, user.twofa_secret);
    if (isValid) {
      await db.run(
        `UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id_user = ?`,
        [userId]
      );
    }
    return isValid;
}
