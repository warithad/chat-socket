import { Prisma } from "@prisma/client"
import prisma from '../lib/prisma'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config();

export const findUserByEmail = async(email: string)=>{
    return await prisma.user.findFirst({where: {email}, select: {id: true, email: true, username: true, password: true}})
}

export const findUserByUsername = async (username: string) => {
    return await prisma.user.findFirst({where: {username}, select: {id: true, email: true, username: true, password: true}})
}

export const createUser = async(userData: Omit<Prisma.UserCreateInput, 'chatRooms' | 'messages'>)=>{
    userData.password = bcrypt.hashSync(userData.password, 8);
    return await prisma.user.create({
        data: userData,
        select: {
            id: true,
            username: true,
            email: true
        }
    })
}

export const generateJWT = (id: string)=>{
    if(!process.env.JWT_SECRET) throw new Error('JWT secret not found')

    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 86400 })
}

export const comparePasswords = (password: string, encryptedPassword: string)=>{
    return bcrypt.compareSync(password, encryptedPassword)
}

