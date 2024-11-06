import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IuserSchema {
    username:string;
    email:string;
    password:string;
    fullName:string;
    avatar?:string;
    refreshToken?:string;
    comparePassword(password:string):Promise<boolean>;
    generateAccessToken():Promise<string>;
    generateRefreshToken():Promise<string>;
}

const userSchema = new Schema<IuserSchema>({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Email is required"],
        lowercase:true,
        trim:true,
        index:true,
    },
    fullName:{
        type:String,
        required:[true,"Full name is required"],
        trim:true,
    },
    avatar:{
        type:String,
        default:null,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    refreshToken:{
        type:String,
    }
}, { timestamps: true });

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword = async function (password:string):Promise<boolean>{
    return await bcrypt.compare(password,this.password);
}



userSchema.methods.generateAccessToken = async function ():Promise<string>{
    return jwt.sign({
        id:this._id,
        email:this.email,
        fullName:this.fullName,
        username:this.username
    },
    String(process.env.ACCESS_TOKEN_SECRET),
    {
        expiresIn: String(process.env.ACCESS_TOKEN_EXPIRY)
    })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        _id: this._id,
      },
      String(process.env.REFRESH_TOKEN_SECRET),
      {
        expiresIn: String(process.env.REFRESH_TOKEN_EXPIRY),
      }
    );
  };
export const User = model("User",userSchema);