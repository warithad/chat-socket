import {validate, socketErrorHandler, errorHandler} from './middlewares'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import { AppError } from './utility-classes'
import type { Request, Response } from 'express'
import { z } from 'zod'
import type { Socket }  from 'socket.io'

vi.mock('lib/utility-classes', ()=>({
    AppError: class {
        constructor(public type: string, public message: string){}
    }   
}))

describe('Middlewares', ()=>{
    describe('validate', ()=>{
        let req: Request
        let res: Response
        const next = vi.fn()

        beforeEach(()=> {
            vi.restoreAllMocks();
            res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response
            req = {} as Request
        })

        it('should throw an error when given an invalid request', async()=>{
            const schema = z.object({
                body: z.object({
                    username: z.string(),
                    password: z.string()
                })
            })
            req.body = {}
            await validate(schema)(req, res, next);
            
            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
            expect(next.mock.calls[0][0].message).toBe('Invalid or missing inputs provided for: username, password')
            expect(next.mock.calls[0][0].type).toBe('validation') 
        })

        it('should succeed with a valid request', async()=>{
            const schema = z.object({
                body: z.object({
                    username: z.string(),
                    password: z.string()
                })
            })
            req.body = {
                username: 'somestring',
                password: 'anotherstring'
            }

            await validate(schema)(req, res, next);
            expect(next).toHaveBeenCalledWith()
        })
    })

    describe('errorHandler', ()=>{
        let req: Request
        let res: Response
        const next = vi.fn()

        beforeEach(()=>{
            vi.restoreAllMocks()
            res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as unknown as Response
            req = {} as Request
        })

        it('should return a statusCode 500', ()=>{
            const error = new Error('error')
            errorHandler(error, req, res, next)
            expect(res.status).toHaveBeenCalledWith(500)
        })
        
        it('should return a static error message', ()=>{
            const error = new Error('error')
            errorHandler(error, req, res, next)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Oops something went wrong...'
            })
        })

        it('should return a message from instance of AppError', ()=>{
            const error = new AppError('unauthorized', 'Something went wrong')
            errorHandler(error, req, res, next)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Something went wrong'
            })
        })
    })

    describe('socketErrorHandler', ()=>{
        let socket: Socket;

        beforeEach(() => {
            vi.restoreAllMocks();
            socket = {
                emit: vi.fn()
            } as unknown as Socket
        })

        it('should emit with static error message', ()=> {
            const error = new Error('error')
            socketErrorHandler(error, socket)

            expect(socket.emit).toBeCalledWith('error', {
                err: {
                    code: 500,
                    message: 'Oops something went wrong...'
                }
            })
        })

        it('should emit with appropriate error message of AppError instance', () => {
            const error = new AppError('unauthorized', 'Server error')
            socketErrorHandler(error, socket)
            expect(socket.emit).toBeCalledWith('error', {
                err: {
                    code: 500,
                    message: 'Server error'
                }
            })
        })
    })
})