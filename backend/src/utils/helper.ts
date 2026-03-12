import { NextFunction, Request, Response } from "express";
export const asyncHandler  = (fn:(req:Request, res:Response, next:NextFunction) => Promise<void>) => {
    return (req:Request, res:Response, next:NextFunction):void => {
        fn(req, res, next).catch(next);
    }
}

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

