import { Status } from "../config/constants";
import { Expense } from "../models/expense.model";
import { SharedPayment } from "../models/sharedPayment.model";
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
                Status.InternalServerError,
                `Something went wrong while generating refresh & access tokens : ${error.message}`
              );
        }
        else{
            throw new apiError(Status.InternalServerError, "Something went wrong while generating refresh & access tokens");
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
    return res.status(Status.Created).json(new apiResponse(Status.Created,  createdUser,"User registered successfully"));
});

const loginUser = asyncHandler(async (req,res) => {
    const {email, username, password} = req.body;
    if((!username && !email))
    {
        throw new apiError(Status.BadRequest, "Username or email is required");
    }
    if(!password)
    {
        throw new apiError(Status.BadRequest, "Password is required");
    }
    const user = await User.findOne({$or: [{username}, {email}]});
    if(!user)
    {
        throw new apiError(Status.Unauthorized, "User not found");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect)
    {
        throw new apiError(Status.Unauthorized, "Invalid credentials");
    }
    const tokens = await generateAccessAndRefreshTokens(
        user._id.toString()
    );
    if(!tokens)
    {
        throw new apiError(Status.InternalServerError, "Something went wrong while generating tokens");
    }
    const { accessToken, refreshToken } = tokens;

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(Status.Ok)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new apiResponse(Status.Ok, { user: loggedinUser, accessToken, refreshToken }, "User logged in successfully"));
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined
        }
    },{
        new:true
    })

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res
    .status(Status.Ok)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(Status.Ok, {}, "User logged out successfully"));
})

const getCurrentUser = asyncHandler(async (req,res) => {
    const totalAmount = await Expense.aggregate([
        { $match: { owner: req.user?._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    if((!totalAmount) || !req.user)
    {
        throw new apiError(Status.NotFound, "Error fetching user details");
    }
    const toRecievePayments = await SharedPayment.aggregate([
        { $match: {receiverId: req.user?._id, pending: true} },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const toPayPayments = await SharedPayment.aggregate([
        { $match: {payerId: req.user?._id, pending: true} },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    if((!toRecievePayments) || (!toPayPayments))
    {
        throw new apiError(Status.NotFound, "Error fetching user details");
    }
    const userData = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        toCollect: toRecievePayments.length > 0 ? toRecievePayments[0].total : 0,
        toPay: toPayPayments.length > 0 ? toPayPayments[0]?.total : 0,
        totalExpenses: totalAmount.length>0 ? totalAmount[0]?.total : 0
    };

    return res.status(Status.Ok).json(new apiResponse(Status.Ok, userData, "User fetched successfully"));
})

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const { currentPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    if(!user)
    {
        throw new apiError(Status.NotFound, "User not found");
    }
    if(!currentPassword || !newPassword){
        throw new apiError(Status.BadRequest, "Current password and new password are required");
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if(!isPasswordCorrect)
    {
        throw new apiError(Status.Unauthorized, "Invalid current password");
    }
    user.password = newPassword;

    await user.save({validateBeforeSave:false});
    
    return res.status(Status.Ok).json(new apiResponse(Status.Ok,{}, "Password changed successfully"));
})

const findUserByUsernameorEmail = asyncHandler(async(req,res) => {
    const {username, email} = req.body;
    if(!username && !email)
    {
        throw new apiError(Status.BadRequest, "Username or email is required");
    }
    const user = await User.findOne({$or: [{username}, {email}]}).select("-password -refreshToken");
    if(!user)
    {
        throw new apiError(Status.NotFound, "User not found");
    }
    return res.status(Status.Ok).json(new apiResponse(Status.Ok, user, "User found successfully"));
})

export {registerUser, loginUser, logoutUser, getCurrentUser, changeCurrentPassword, findUserByUsernameorEmail};