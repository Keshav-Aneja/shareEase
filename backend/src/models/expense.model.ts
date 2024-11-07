import {Schema, model} from "mongoose";
export interface Split {
    user_id: string;
    split_amount: number;
}
export interface IExpense {
    owner: Schema.Types.ObjectId;
    amount:number; //if split is empty then amount will be the total amount, i.e. all the amount belongs to me, but if the splitting is there then  this amount will be my share in the split, while other's split get added to them
    paidAmount:number; //this will be the total amount paid by the user
    category?:string;
    description?:string;
    date:Date;
    split?:Split[];
    //if the split[] is empty then it means, I am not splitting with anyone else
}

const ExpenseSchema = new Schema<IExpense>({
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    amount:{
        type:Number,
        required:true,
        default:0,
    },
    paidAmount:{
        type:Number,
        required:true,
        default:0
    },
    category:{
        type:String,
        default:"",
        required:false,
    },
    description:{
        type:String,
        trim:true,
        required:false,
    },
    date:{
        type:Date,
        default:Date.now(),
        required:true,
    },
    split:{
        type: [{
            user_id: Schema.Types.ObjectId,
            split_amount: Number,
        }],
        ref:"User",
        required:false,
        default:[],
    }
},{timestamps:true});

export const Expense = model("Expense",ExpenseSchema);