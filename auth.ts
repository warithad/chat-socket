require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

import {send} from './mailing'
import { PrismaClient } from '@prisma/client';


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const prisma = new PrismaClient();


export function getAccessToken(payload: any): string {
    var token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    return token;
}

export function verifyAccessToken(token: string): any{
    return jwt.verify(token, ACCESS_TOKEN_SECRET, function(err: Error, payload: any){
        if(err){
            throw new Error(err.message);
        }
            return payload;
        }
    );   
}

export async function signIn(req: any, res: any, next: any){
    const { email, password } = req.body;
    var agent = req.get('User-Agent')
    var clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            email,
            password
        }
    })

    if(!(user && bcrypt.compare(password, user?.password))){
        return res.status(401).json({
            message: 'Username or password is incorrect'
        })
    }

    //Send notification that someone logged into account
    //TODO: Find some library to convert ipaddress to readable location for user
    //TODO: Attach the basic info of the last few active groupchats this user is a member chronological order 
    
    var mailOptions = {
                to: email,
                subject: 'Account Login',
                text: `Someone tried to sign into your account, \n 
                        Device: ${agent}\n
                        Client: ${clientIp}\n
                        Date: ${getCurrentDateTime()}\n
                        Was this you?, If no click the link below
                       `
    }
    send(mailOptions);
    var accessToken = getAccessToken({email: email})
    res.status(200).json({
        message: 'Login successful',
        user: {
            email: email
        },
        accessToken: accessToken,
        groupchats: []
    })
}


export async function signUp(req: any, res: any, next: any){
    const { email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if(existingUser){ 
        return res.status(401)
                  .json({
                        message: "User already exists"
                   })
    }   

    //Send email for confirmation of account creation
    

    const encryptedPassword = bcrypt.encrypt(password);
    const user = await prisma.user.create({
        data: {
            email: email,
            password: encryptedPassword
        }
    });

    return res.status(200).json({
        user: {
            email: email
        }
    })
}


function getCurrentDateTime(): string {
    //Todo make this function return utc date time
    
    const now = new Date();

    const year = now.getFullYear;
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate.toString().padStart(2, '0');
    const hours = now.getHours.toString().padStart(2, '0');
    const minutes = now.getMinutes.toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`
}