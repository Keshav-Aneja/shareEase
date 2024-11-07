import { type Request, type Response, type NextFunction } from "express";
import type { ClientSession, Model as MongooseModel } from "mongoose";

export interface TransactionRequestHandler {
    (req: Request, res: Response, next: NextFunction, session: ClientSession): Promise<any>;
}

const asyncTransactionHandler = <T>(Model: MongooseModel<any>, requestHandler: TransactionRequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let session: ClientSession | null = null;
        
        try {
            // Start a new session and begin a transaction
            session = await Model.startSession();
            session.startTransaction();
            
            // Pass the session to the request handler
            await requestHandler(req, res, next, session);
            
            // Commit the transaction if no errors
            await session.commitTransaction();
        } catch (error) {
            // Rollback the transaction on error
            if (session) {
                await session.abortTransaction();
            }
            next(error);
        } finally {
            // End the session in either case
            if (session) {
                session.endSession();
            }
        }
    };
};

export { asyncTransactionHandler };
