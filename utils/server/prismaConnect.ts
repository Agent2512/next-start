import { PrismaClient } from "../../prisma/lib/main"
import { PrismaClient as PrismaClient_saf } from '../../prisma/lib/saf';
import { PrismaClient as PrismaClient_common } from '../../prisma/lib/common';

declare global {
    // allow global `var` declarations
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
    var prisma_saf: PrismaClient_saf | undefined
    var prisma_common: PrismaClient_common | undefined
}

export const prismaConnect = global.prisma ||= new PrismaClient()
export const prismaConnect_saf = global.prisma_saf ||= new PrismaClient_saf()
export const prismaConnect_common = global.prisma_common ||= new PrismaClient_common()

// if (process.env.NODE_ENV !== 'production') global.prisma = prismaConnect
// if (process.env.NODE_ENV !== 'production') global.prisma_saf = prismaConnect_saf
// common