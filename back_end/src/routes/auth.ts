import { FastifyInstance } from "fastify";
import authController from "../controllers/auth.controller";
import userController from "../controllers/user.controller";
import {
    validate,
    SignInSchema,
    SignUpSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    Verify2FASchema,
    GoogleAuthSchema,
    IntraAuthSchema,
    ChangePasswordSchema,
    UpdateAccountSchema
} from "../validation";

const authRoute = async (app: FastifyInstance) => {
    app.post("/signin", { preHandler: validate(SignInSchema) }, authController.signIn);
    app.post("/signup", { preHandler: validate(SignUpSchema) }, authController.signUp);
    app.post("/forgotpassword", { preHandler: validate(ResetPasswordSchema) }, authController.forgotPassword);
    app.post("/declareforgotpassword", { preHandler: validate(ForgotPasswordSchema) }, authController.declareForgotPassword);

    app.get("/me", authController.me);
    app.post("/refresh", authController.refresh);
    app.post("/signout", authController.signOut);
    app.post("/google-signin", { preHandler: validate(GoogleAuthSchema) }, authController.googleSignIn);

    app.post("/sign2fa", { preHandler: validate(Verify2FASchema) }, authController.signIn2FA);
    app.post("/intra-signin", { preHandler: validate(IntraAuthSchema) }, authController.intraSignIn);

    app.post("/account", { preHandler: validate(UpdateAccountSchema) }, authController.updateAccount);
    app.post("/change-password", { preHandler: validate(ChangePasswordSchema) }, authController.changePassword);


};

export default authRoute;
