import { User } from "../models/user.model";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req,_,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token)
        {
            throw new apiError(401, "Unauthorized: Access token is required");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

        if(!user)
        {
            throw new apiError(401, "Unauthorized: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if(error instanceof Error)
        {
            throw new apiError(401, `${error.message}`);
        }
        else{
            throw new apiError(401, "Invalid access token");
        }
    }
})