import {Router} from "express";
import { changeCurrentPassword, findUserByUsernameorEmail, getCurrentUser, loginUser, logoutUser, registerUser } from "../controller/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const userRouter =  Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/me").get(verifyJWT, getCurrentUser);
userRouter.route("/change-password").patch(verifyJWT, changeCurrentPassword);
userRouter.route("/find").post(verifyJWT, findUserByUsernameorEmail);
export default userRouter;