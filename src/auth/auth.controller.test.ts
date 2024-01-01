import type { Request, Response } from 'express'
import * as AuthService from './auth.service'
import * as AuthController from './auth.controller'
import * as ChatroomService from 'chatroom/chatroom.service'
import {beforeEach, vi, expect, it, describe } from 'vitest'
import { AppError } from 'lib/utility-classes'


vi.mock('auth/auth.service', ()=> ({
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    createUser: vi.fn(),
    generateJWT: vi.fn(),
    comparePasswords: vi.fn()
}))

vi.mock('chatroom/chatroom.service', () =>({
    getUserChatRooms: vi.fn()
}))

vi.mock('lib/utility-classses', ()=>({
    AppError: class{
        constructor(public type: string, public message: string){}
    }
}))

describe('auth.controller', ()=>{

    describe('signup', ()=>{
        let req: Request
        let res: Response
        const next = vi.fn()

        beforeEach(()=>{
            vi.resetAllMocks();
            req = {
                body: {
                    username: 'testusername',
                    email: 'testemail',
                    password: 'somepassword',
                }
            } as Request
            res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response
        })

        it('should throw a validation error if the username already exists', async()=>{
            vi.mocked(AuthService.findUserByUsername).mockResolvedValueOnce({
                id: 'testid',
                email: 'email',
                username: 'testusername', 
                password: 'hashedpassword'   
            })

            await AuthController.signup(req, res, next);
            expect(AuthService.findUserByUsername).toHaveBeenCalledWith('testusername')
            expect(next).toBeCalled()
            expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
            expect(next.mock.calls[0][0].message).toBeTypeOf('string')
            expect(next.mock.calls[0][0].message).toStrictEqual('A user already exists with this username')
        })

        it('should throw a validation error if email already exists', async()=>{
            vi.mocked(AuthService.findUserByUsername).mockResolvedValueOnce(null)
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                id: 'testid',
                email: 'testemail',
                username: 'username',
                password: 'hashedpassword'
            })

            await AuthController.signup(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
            expect(next.mock.calls[0][0].message).toBeTypeOf('string')
            expect(next.mock.calls[0][0].message).toStrictEqual('A user already exists with this email')
        })
    
        it('should create new user if email and username have not been taken', async ()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)
            vi.mocked(AuthService.findUserByUsername).mockResolvedValueOnce(null)
            vi.mocked(AuthService.createUser).mockResolvedValueOnce({
                id: 'testid',
                email: 'testemail',
                username: 'testusername'
            })
            await AuthController.signup(req, res, next)
            expect(AuthService.createUser).toHaveBeenCalledWith(req.body)
        })

        it('should create jwt token', async()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)
            vi.mocked(AuthService.findUserByUsername).mockResolvedValueOnce(null)
            vi.mocked(AuthService.createUser).mockResolvedValueOnce({
                id: 'testid',
                email: 'testemail',
                username: 'testusername'
            })
            vi.mocked(AuthService.generateJWT).mockReturnValueOnce('testjwttoken')

            await AuthController.signup(req, res, next)
            expect(AuthService.generateJWT).toHaveBeenCalledWith('testid')
        })

        it('should respond with a correct status code, user and message', async ()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)
            vi.mocked(AuthService.findUserByUsername).mockResolvedValueOnce(null)
            vi.mocked(AuthService.createUser).mockResolvedValueOnce({
                id: 'testid',
                username: 'testusername',
                email: 'testemail'
            })
            vi.mocked(AuthService.generateJWT).mockReturnValueOnce('testjwttoken')

            await AuthController.signup(req, res, next)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Registered successfully',
                user: {
                    id: 'testid',
                    username: 'testusername',
                    email: 'testemail'
                },
                token: 'testjwttoken'
            })
        })
    })

    describe('signin', ()=>{
        let req: Request
        let res: Response
        const next = vi.fn()

        beforeEach(()=> {
            vi.resetAllMocks()
            req = {
                body: {
                    email: 'testemail',
                    password: 'testpassword'
                }
            } as Request
            res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
                
            } as unknown as Response
        })


        it('should throw validation error for a email that does not exist', async ()=> {
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                email: 'mockedemail',
                id: 'mockedid',
                password: 'testpassword',
                username: 'someusername',
            })

            await AuthController.signin(req, res, next)

            expect(next).toHaveBeenCalled
            expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
            expect(next.mock.calls[0][0].type).toBe('validation')
            expect(next.mock.calls[0][0].message).toBeTypeOf('string')
        })


        it('should throw validation error for a wrong password', async()=> {
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                email: 'testemail',
                id: 'mockedid',
                password: 'hashedpassword',
                username: 'someusername',
            })

            await AuthController.signin(req, res, next)

            expect(AuthService.comparePasswords).toHaveBeenCalledWith(req.body.password, 'hashedpassword')
            expect(next).toHaveBeenCalled
            expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
            expect(next.mock.calls[0][0].type).toBe('validation')
            expect(next.mock.calls[0][0].message).toBeTypeOf('string')
        })

        it('should find ids and titles of all chatrooms user is a member of', async()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                email: 'testemail',
                id: 'mockedid',
                password: 'hashedpassword',
                username: 'someusername'
            })
            vi.mocked(AuthService.comparePasswords).mockResolvedValueOnce(true)
            vi.mocked(ChatroomService.getUserChatRooms).mockResolvedValueOnce([
              {id: 'test1chatroom', title: 'chatroom1'},
              {id: 'test2chatroom', title: 'chatroom2'}  
            ])

            await AuthController.signin(req, res, next)
            expect(ChatroomService.getUserChatRooms).toHaveBeenCalledWith('mockedid')
        })  

        it('should create jwt token successfully', async()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                email: 'testemail',
                id: 'mockedid',
                password: 'hashedpassword',
                username: 'someusername'
            })
            vi.mocked(AuthService.comparePasswords).mockResolvedValueOnce(true)
            vi.mocked(ChatroomService.getUserChatRooms).mockResolvedValueOnce([
              {id: 'test1chatroom', title: 'chatroom1'},
              {id: 'test2chatroom', title: 'chatroom2'}  
            ])

            await AuthController.signin(req, res, next)

            expect(AuthService.generateJWT).toHaveBeenCalledWith('mockedid')
        })  

        it('should respond with status code, user, chatrooms[{id, title}] and message', async()=>{
            vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
                email: 'testemail',
                id: 'mockedid',
                password: 'hashedpassword',
                username: 'someusername'
            })
            vi.mocked(AuthService.comparePasswords).mockResolvedValueOnce(true)
            vi.mocked(ChatroomService.getUserChatRooms).mockResolvedValueOnce([
              {id: 'test1chatroom', title: 'chatroom1'},
              {id: 'test2chatroom', title: 'chatroom2'}  
            ])
            vi.mocked(AuthService.generateJWT).mockResolvedValueOnce('mockedjwt')

            await AuthController.signin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                
                message: 'Sign in successful',
                user:  {
                    id: 'mockedid',
                    email: 'testemail',
                    username: 'someusername',
                    chatRooms: [{id: 'test1chatroom', title: 'chatroom1'},
                                {id: 'test2chatroom', title: 'chatroom2'} 
                    ]
                },
                token: 'mockedjwt'
            })
        })
    })
})