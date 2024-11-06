import { type Request, type Response, type NextFunction } from "express";

interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const asyncHandler = (requestHandler: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

export { asyncHandler };
