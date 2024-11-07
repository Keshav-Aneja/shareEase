import { Status } from "../config/constants";
import { Expense, type IExpense, type Split } from "../models/expense.model";
import { User } from "../models/user.model";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { asyncTransactionHandler } from "../utils/asyncTransactionHandler";

// const addNewExpense = asyncHandler(async (req,res,next) => {
//     const {amount,category,date,description,split} = req.body;
//     if(!amount)
//     {
//         throw new apiError(Status.BadRequest, "Amount is required");
//     }
//     const newExpense = await Expense.create({
//         owner: req.user?._id,
//         amount,
//         category: category ?? "",
//         date: date ? new Date(date) : new Date(),
//         description: description ?? "",
//     })

//     const expense = await Expense.findById(newExpense._id).populate("owner", "username email fullName");

//     if(!expense)
//     {
//         throw new apiError(Status.BadRequest,"Error adding expense");
//     }

//     return res.status(Status.Created).json(new apiResponse(Status.Created, expense, "Expense added successfully"));
// })

const deleteExpense = asyncHandler(async (req,res) => {
    const {id} = req.params;
    const expense = await Expense.findById(id);
    if(!expense)
    {
        throw new apiError(Status.BadRequest,"Expense not found or already deleted");
    }

    await Expense.deleteOne({_id: id});
    return res.status(Status.Ok).json(new apiResponse(Status.NoContent, {}, "Expense deleted successfully"));
})

const updateExpense = asyncHandler(async(req,res) => {
    const {expenseId} = req.params;
    const {amount,category,date,description} = req.body;

    const expense = await Expense.findById(expenseId);
    if(!expense)
    {
        throw new apiError(Status.BadRequest, "Expense not found");
    }

    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ? new Date(date) : expense.date;
    expense.description = description ?? expense.description;

    await expense.save();
    return res.status(Status.Ok).json(new apiResponse(Status.Ok,expense, "Expense updated successfully"));
})

const getAllExpenses = asyncHandler(async(req,res) => {
    const expenses = await Expense.find({owner: req.user?._id}).select("-owner").sort({date: -1});
    
    return res.status(Status.Ok).json(new apiResponse(Status.Ok, expenses, "Expenses fetched successfully"));
})

const getExpenseById = asyncHandler(async(req,res) => {
    const {id} = req.params;
    if(!id)
    {
        throw new apiError(Status.BadRequest, "Expense id is required");
    }
    const expense = await Expense.findById(id).populate("owner", "username email fullName");
    if(!expense)
    {
        throw new apiError(Status.BadRequest, "Expense not found");
    }
    return res.status(Status.Ok).json(new apiResponse(Status.Ok, expense, "Expense fetched successfully"));
})

const addNewExpense = asyncTransactionHandler(Expense,async(req,res,next,session) => {
    const {amount,category,date,description,split} = req.body;
    let userSplits:Split[] = [];
    if(split)
    {
        userSplits = split;
    }
    if(!amount)
    {
        throw new apiError(Status.BadRequest, "Amount is required");
    }
    let myAmount = amount;
    if(userSplits && userSplits.length > 0)
    {  
        console.log(userSplits);
        const myShare = userSplits.find((s) => s.user_id == String(req.user?._id));
        console.log(`ID: ${req.user?._id}, MY SHARE: ${myShare}`);
        if(myShare)
        {
            myAmount = myShare.split_amount ?? amount;
        }
    }
    for(const user_split of userSplits){
        if(user_split.user_id !== String(req.user?._id)) {
            const user = await User.findById(user_split.user_id).session(session);
            if(!user)
            {
                throw new apiError(Status.BadRequest, "Error splitting amounts among users");
            }
            const newPendingPayments = user.pendingPayments || [];
            newPendingPayments.push({
                user_id: req.user?._id,
                amount: user_split.split_amount,
                pending: true,
            })
            user.pendingPayments = newPendingPayments;
            await user.save({session})
        }
    }
    const newExpense = await Expense.create([{
        owner: req.user?._id,
        amount:myAmount,
        paidAmount:amount,
        category: category ?? "",
        date: date ? new Date(date) : new Date(),
        description: description ?? "",
        split: split ? split : [],
    }],{session})
    const expense = await Expense.findById(newExpense[0]._id).populate("owner", "username email fullName").session(session);

    if(!expense)
    {
        throw new apiError(Status.BadRequest,"Error adding expense");
    }

    return res.status(Status.Created).json(new apiResponse(Status.Created, expense, "Expense added successfully"));
})

export {addNewExpense, deleteExpense, updateExpense, getAllExpenses, getExpenseById,newRoute}