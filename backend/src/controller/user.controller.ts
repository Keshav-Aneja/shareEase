import { User } from "../models/user.model";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const generateAccessAndRefreshTokens = async (userId:string) => {
    try {
      const user = await User.findById(userId);
      if(!user)
      {
        return;
      }
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error:unknown) {
        if(error instanceof Error)
        {
            throw new apiError(
                500,
                `Something went wrong while generating refresh & access tokens : ${error.message}`
              );
        }
        else{
            throw new apiError(500, "Something went wrong while generating refresh & access tokens");
        }
    }
  };
const registerUser = asyncHandler(async (req,res) => {
    const { username, email, password, fullName } = req.body;
    if([fullName, username, email, password].some((field) => !field || field.trim() === '')) {
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({$or: [{username}, {email}]});
    if(existingUser) {
        throw new apiError(409, "User with username or email already exists");
    }

    const user = await User.create({username: username.toLowerCase(), email, password, fullName});

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser)
    {
        throw new apiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(new apiResponse(201,  createdUser,"User registered successfully"));
});

const loginUser = asyncHandler(async (req,res) => {
    const {email, username, password} = req.body;
    if((!username && !email))
    {
        throw new apiError(400, "Username or email is required");
    }
    if(!password)
    {
        throw new apiError(400, "Password is required");
    }
    const user = await User.findOne({$or: [{username}, {email}]});
    if(!user)
    {
        throw new apiError(404, "User not found");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect)
    {
        throw new apiError(401, "Invalid credentials");
    }
    const tokens = await generateAccessAndRefreshTokens(
        user._id.toString()
    );
    if(!tokens)
    {
        throw new apiError(500, "Something went wrong while generating tokens");
    }
    const { accessToken, refreshToken } = tokens;

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new apiResponse(200, { user: loggedinUser, accessToken, refreshToken }, "User logged in successfully"));
})

export {registerUser, loginUser};