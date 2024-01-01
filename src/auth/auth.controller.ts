import { Request, RequestHandler } from "express";
import { AppError } from "lib/utility-classes";
import { SigninSchema, SignupSchema } from "./auth.schemas";
import * as ChatroomService from "chatroom/chatroom.service";
import * as AuthService from './auth.service'

export const signup: RequestHandler = async(
    req: Request<unknown, unknown, SignupSchema>,
    res,
    next
)=>{
    const userData = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }

    if( await AuthService.findUserByUsername(userData.username) ){
        return next(
            new AppError('validation', 'A user already exists with this username')
        )
    }

    if( await AuthService.findUserByEmail(userData.password) ){
        return next(
            new AppError('validation', 'A user already exists with this email')
        )
    }

    const newUser = await AuthService.createUser(userData);
    const token = AuthService.generateJWT(newUser.id);

    res.status(200).json({
        message: 'Registered successfully',
        user: newUser,
        token
    })
}

//TODO: Implement this function to also permit username & password logins
export const signin: RequestHandler = async(
    req: Request<unknown, unknown, SigninSchema>,
    res,
    next
)=>{
    const userData = {
        email: req.body.email,
        password: req.body.password
    }

    const existingUser = await AuthService.findUserByEmail(userData.email);
    
    if(!existingUser){
        return next(new AppError('validation', 'Email or Password is incorrect'))
    }
    
    if(!AuthService.comparePasswords(userData.password, existingUser.password)){
        return next(new AppError('validation', 'Email or Password is incorrect'))
    }

    const chatRooms = await ChatroomService.getUserChatRooms(existingUser.id);
    const token = await AuthService.generateJWT(existingUser.id);
    
    res.status(200).json({
        message: 'Sign in successful',
        user: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            chatRooms 
        },
        token
    })
}

