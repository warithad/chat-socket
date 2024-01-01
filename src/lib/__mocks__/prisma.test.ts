import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'
import { describe } from 'vitest'

const prisma = mockDeep<PrismaClient>()

beforeEach(() => {
    mockReset(prisma)
})

describe.skip('prisma.test', ()=>{})

export default prisma;