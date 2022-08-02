import { PrismaClient } from "../../prisma/lib/main"
import { PrismaClient as PrismaClient_saf } from '../../prisma/lib/saf';

declare global {
    // allow global `var` declarations
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
    var prisma_saf: PrismaClient_saf | undefined
}

export const prismaConnect = global.prisma ||= new PrismaClient()
export const prismaConnect_saf = global.prisma_saf ||= new PrismaClient_saf()

// if (process.env.NODE_ENV !== 'production') global.prisma = prismaConnect
// if (process.env.NODE_ENV !== 'production') global.prisma_saf = prismaConnect_saf