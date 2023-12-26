import { z } from 'zod'

export const CreateMessageSchema = z.object({

})


export const DeleteMessageSchema = z.object({

})

export type CreateMessageSchema = z.infer<typeof CreateMessageSchema>
export type DeleteMessageSchema = z.infer<typeof DeleteMessageSchema>