/* eslint-disable no-void */
/* eslint-disable no-undef */
import { PrismaClient } from '@prisma/client';

let prisma = {};

if (typeof window === 'undefined') {
    if ('prisma' in globalThis && '$disconnect' in globalThis.prisma) {
        console.log('prisma disconnect:');
        globalThis.prisma.$disconnect();
    }

    // { log: ["query", "info", "warn"] }
    if (process.env.NODE_ENV === 'production') {
        prisma = new PrismaClient({ log: ['warn'] });
    } else {
        if (!global.prisma) {
            global.prisma = new PrismaClient({ log: ['warn', "info"] });
        }

        prisma = global.prisma;
    }
}

export default prisma;
