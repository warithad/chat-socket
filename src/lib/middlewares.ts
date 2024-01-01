import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "./utility-classes";

export const validate =(schema: AnyZodObject)=> 
   async (req: Request<unknown>, res: Response, next: NextFunction)=>{

        try{
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            })
            return next();
        }
        catch(error){
            if(error instanceof ZodError){
                const invalids = error.issues.map(issue => issue.path.pop())
                next(new AppError('validation', 
                `Invalid or missing input${
                    invalids.length > 1 ? 's' : ''
                } provided for: ${invalids.join(', ')}`
                ))
            }
            else {
                next(new AppError('validation', 'Invalid input'))
            }
        }
}



export const socketErrorHandler = (
    error: Error,
    socket: Socket,
)=> {
    const data = {
        err: {
            code: 'statusCode' in error ? error.statusCode: 500,
            message: error instanceof AppError ? error.message : 'Oops something went wrong...'
        }
    }

    socket.emit('error', data)
} 

export const errorHandler = (
    error: Error,
    _: Request,
    res: Response,
    next: NextFunction
)=> {
    res.status('statusCode' in error ? (error.statusCode as number) : 500)
        .json({
            message: 
                error instanceof AppError 
                    ? error.message 
                    : 'Oops something went wrong...'
        })
}