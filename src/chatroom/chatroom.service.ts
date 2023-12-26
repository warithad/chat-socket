import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'
import { CreateMessageSchema } from './chatroom.schemas'

export const getChatRoomMembers =async(id: string)=>{
    return await prisma.userChatRoom.findMany({
        where: {
            chatRoomId: id
        }, 
        select: {
            user: {
                select: {
                    username: true,
                    id: true
                }
            }
        }
    })
}

export const getChatRoomMessages = async(id: string, startDate: Date, endDate: Date)=>{
    const messages = await prisma.message.findMany({
        where: {
            chatRoomId: id,
            createdAt: {
                lte: endDate,
                gte: startDate
            }
        },
        select: {
            chatRoom: false,
            author: false
        }
    })

    return messages;
}
export const checkUserIsChatRoomMember = async(userId: string, chatRoomId: string)=>{

    const userExists =  await prisma.userChatRoom.findFirst({
        where: {
            userId,
            chatRoomId
        }
    })

    if(!userExists)return true;
    else return false;
}

export const createMessage = async(messageData: Prisma.MessageCreateInput)=>{
    return await prisma.message.create({
        data: messageData,
        include: {
            author: {
                select: {
                    username: true,
                }
            }
        }
    })
}

export const createChatRoom = async(chatRoomData: Prisma.ChatRoomCreateInput)=>{
    return await prisma.chatRoom.create({
        data: chatRoomData
    })
}

