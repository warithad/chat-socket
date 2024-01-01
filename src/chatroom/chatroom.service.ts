import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

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

export const getUserChatRooms = async(userId: string)=>{
    return await prisma.userChatRoom.findMany({
        where: {
            userId
        },
        select: {
            chatRoom: {
                select: {
                    id: true,
                    title: true
                }
            }           
        }
    }).then(userChatRooms => userChatRooms.map(({chatRoom}) => chatRoom))    
    
}

export const getUserChatRoomIds = async(userId: string)=>{
    const chatRooms = await getUserChatRooms(userId);
    return chatRooms.map((chatRoom) => chatRoom.id);
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

export const joinChatRoom = async(userId: string, chatRoomId: string)=>{
    try{
        const user = await prisma.user.findUnique({
            where:{id: userId},
            select: {
                username: true,
                id: true
            }
        })
        const room = await prisma.chatRoom.findUnique({
            where: {id: chatRoomId},
            select: {
                title: true,
                id: true
            }
        })
        if(!user || !room) throw new Error('User or Room does not exist')
        
        const result = await prisma.userChatRoom.create({
            data: {
                userId: user.id,
                chatRoomId: room.id
            } 
        })
        return user;
    }catch(error){
        if(error instanceof Error) throw new Error(error.message)
    }
    
    
}