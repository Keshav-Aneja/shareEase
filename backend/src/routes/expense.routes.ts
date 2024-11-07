import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addNewExpense, deleteExpense, getAllExpenses, getExpenseById, updateExpense } from "../controller/expense.controller";

const expenseRouter = Router();

expenseRouter.route("/").post(verifyJWT,addNewExpense);
expenseRouter.route("/").get(verifyJWT,getAllExpenses);
expenseRouter.route("/:id").get(verifyJWT,getExpenseById);
expenseRouter.route("/:id").delete(verifyJWT,deleteExpense);
expenseRouter.route("/:id").patch(verifyJWT,updateExpense);
export default expenseRouter;