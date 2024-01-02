import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'


beforeEach(() => {
    mockReset(prisma)
})
const prisma = mockDeep<PrismaClient>()
export default prisma;