import { AppError } from "./utility-classes";
import {expect, describe, it} from 'vitest'

describe('utility classes', ()=>{
    describe('AppError', ()=>{
        it('should set the correct statusCodes to different error types', () => {
            const error1 = new AppError('validation', 'Validation error message')       
            const error2 = new AppError('unauthorized', 'Unauthorized error message')
            const error3 = new AppError('server', 'Server error message')
            
            expect(error1.statusCode).toStrictEqual(400)
            expect(error2.statusCode).toStrictEqual(401)
            expect(error3.statusCode).toStrictEqual(500)
        })
        
        it('should set correct error message', () => {
            const error = new AppError('server', 'Server error message')
            expect(error.message).toStrictEqual('Server error message')
        })
    })
})
