import { PrismaClient } from '@prisma/client';
import cuid = require('cuid');

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$transaction(async (tx) => {
            const tipsCount = await tx.$executeRaw`
                UPDATE "Tips" 
                SET "newBatchCreated" = br."newId"
                FROM "Batch_Record" br 
                WHERE "Tips".batch_created = br.old_batch_id
                AND "Tips"."newBatchCreated" IS NULL
            `;
            console.log(`Wellbeing Count: ${tipsCount}.`)
        })

    } catch (error) {
        console.log(error)
    }


}

main()
    .catch((e) => {
        console.error('Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })