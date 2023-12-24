import { z } from 'zod'

//Signin schema and type
export const SigninSchema = z.object({
    body: z.object({
        email: z.string(),
        password: z.string()
    })
})

//Signup schema and type
export const SignupSchema = z.object({
    body: z.object({
        username: z.string(),
        email: z.string(),
        password: z.string()
    })
})

export type SigninSchema = z.infer<typeof SigninSchema>['body']
export type SignupSchema = z.infer<typeof SignupSchema>['body']

