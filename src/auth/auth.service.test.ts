import { describe, it, vi, beforeEach, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'
import prismaMock from 'lib/__mocks__/prisma'
import * as AuthService from './auth.service'

vi.mock('lib/prisma')
vi.mock('jsonwebtoken', ()=>({
   default: {
        sign: vi.fn(),
        verify: vi.fn(() => {id: 'randomid'})
   } 
}))
vi.mock('bcrypt', ()=>({
    default: {
        hashSync: vi.fn(() => 'hashedpass')
    }
}))

describe('auth.service', ()=>{
    const env = process.env
    beforeEach(() => {
        vi.restoreAllMocks()
        process.env = {...env}
    })

    describe('createUser',async () => {
        it('should create and return the user',async () => {
            prismaMock.user.create.mockResolvedValueOnce({
                email: 'mockedemail',
                username: 'mockedusername',
                id: 'mockedid',
            } as User)
            
            const newUser = await AuthService.createUser({
                username: 'mockedusername',
                email: 'mockedemail',
                password: 'somepassword',
             })
     
             expect(newUser).toHaveProperty('id')
             expect(newUser).toHaveProperty('email')
             expect(newUser).toHaveProperty('username')
             expect(newUser).toStrictEqual({
                email: 'mockedemail',
                username: 'mockedusername',
                id: 'mockedid'
             })
        })

        
        it('should encrypt the password',async () => {
            prismaMock.user.create.mockResolvedValueOnce({
                email: 'mockedemail',
                username: 'mockedusername',
                id: 'mockedid',
            } as User)

            await AuthService.createUser({
                username: 'mockedusername',
                email: 'mockedemail',
                password: 'somepassword',
            } as User)

            expect(prismaMock.user.create).toHaveBeenCalledWith(
                {
                data: {
                    username: 'mockedusername',
                    email: 'mockedemail',
                    password: 'hashedpass',
                },
                select:{            
                    id: true,
                    username: true,
                    email: true,
                }
                }
            )
        })
    })

    describe('generateJWT', () => {
        it('should throw error when secret key is not found', ()=>{
            expect(() => AuthService.generateJWT('userid')).toThrow()
        })

        it('should return valid jwt when secret key is available', ()=>{
            process.env.JWT_SECRET = 'secret'
            AuthService.generateJWT('userid')
            expect(jwt.sign).toBeCalled()
            expect(jwt.sign).toHaveBeenCalledWith({id: 'userid'}, 'secret', {expiresIn: 86400})
        })
    })

})