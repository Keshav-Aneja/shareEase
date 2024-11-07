import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getAllPayments } from "../controller/payments.controller";

const paymentsRouter = Router();

paymentsRouter.route("/").get(verifyJWT,getAllPayments);