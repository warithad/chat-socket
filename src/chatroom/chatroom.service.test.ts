import {describe, expect, vi, it, beforeEach} from 'vitest'
import * as ChatroomService from 'chatroom/chatroom.service'
import prismaMock from 'lib/__mocks__/prisma'
import { ChatRoom, UserChatRoom, Message, User } from '@prisma/client'


vi.mock('lib/prisma')

describe('chatroom.service', ()=>{
    
    beforeEach(()=>{
        vi.restoreAllMocks();
    })

    describe('joinChatRoom', async ()=>{
        
        it('should return user object', async()=>{
            prismaMock.user.findUnique.mockResolvedValueOnce({
                id: 'userid',
                username: 'username',
            } as User)

            prismaMock.chatRoom.findUnique.mockResolvedValueOnce({
                id: 'chatroomid',
                title: 'chatroomtitle',
            } as ChatRoom)

            const result = await ChatroomService.joinChatRoom('userid', 'chatroomid')
            expect(result).toHaveProperty('id')
            expect(result).toHaveProperty('username')
        })

        it('should throw and catch error if user or room does not exist', async()=>{
            prismaMock.user.findUnique.mockResolvedValueOnce(null)
            prismaMock.chatRoom.findUnique.mockResolvedValueOnce({
                id: 'chatroomid',
                title: 'chatroomtitle',
            } as ChatRoom)
           await ChatroomService.joinChatRoom('userid', 'chatroomid')
           expect(ChatroomService.joinChatRoom).not.toThrow()
        })
    })

})