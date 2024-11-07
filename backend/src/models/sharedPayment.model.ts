import {Schema, model} from "mongoose";

export interface ISharePayments {
    payerId:string;
    receiverId:string;
    amount:number;
    expenseId:string;
    pending:boolean;
}

const sharedPaymentSchema = new Schema<ISharePayments>({
    payerId:{
        type:String,
        required:[true,"Payer ID is required"],
    },
    receiverId:{
        type:String,
        required:[true,"Receiver ID is required"],
    },
    amount:{
        type:Number,
        required:[true,"Amount is required"],
    },
    expenseId:{
        type:String,
        required:[true,"Expense ID is required"],
    },
    pending:{
        type:Boolean,
        default:true,
    },
});

export const SharedPayment = model("SharedPayment", sharedPaymentSchema);