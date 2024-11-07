import { Status } from "../config/constants";
import { SharedPayment } from "../models/sharedPayment.model";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getAllPayments = asyncHandler(async (req, res) => {
    const {filter} = req.query;
    if(filter === 'received') {
        const payments = await SharedPayment.find({receiverId: req.user?._id});
        return res.status(Status.Ok).json(new apiResponse(Status.Ok,payments, 'Payments fetched successfully'));
    }
    if(filter === 'sent') {
        const payments = await SharedPayment.find({payerId: req.user?._id});
        return res.status(Status.Ok).json(new apiResponse(Status.Ok,payments, 'Payments fetched successfully'));
    }
    const payments = await SharedPayment.find({$or: [{receiverId: req.user?._id}, {payerId: req.user?._id}]});
    return res.status(Status.Ok).json(new apiResponse(Status.Ok,payments, 'Payments fetched successfully'));
})

export {getAllPayments}