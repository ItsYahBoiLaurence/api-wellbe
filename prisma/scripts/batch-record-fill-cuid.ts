import { PrismaClient } from "@prisma/client";
import cuid = require('cuid')

const prisma = new PrismaClient()

async function main() {
    // const brs = await prisma.batch_Record.findMany({
    //     where: {
    //         newId: null
    //     }
    // })

    // for (const br of brs) {
    //     const newId = cuid()
    //     await prisma.batch_Record.update({
    //         where: {
    //             id: br.id
    //         },
    //         data: {
    //             newId
    //         }
    //     })
    // }

    // console.log(`${brs.length} updated Data`)


    const brs = await prisma.batch_Record.findMany()

    // for (const br of brs) {
    //     await Promise.all([
    //         await prisma.wellbeing.updateMany({
    //             where: {
    //                 batch_id: br.id
    //             },
    //             data: {
    //                 newBatchId: br.newId
    //             }
    //         }),

    //         await prisma.employee_Under_Batch.updateMany({
    //             where: {
    //                 batch_id: br.id
    //             },
    //             data: {
    //                 newBatchId: br.newId
    //             }
    //         }),

    //         await prisma.userAdvice.updateMany({
    //             where: {
    //                 batch_created: br.id
    //             },
    //             data: {
    //                 newBatchCreated: br.newId
    //             }
    //         })
    //     ])
    // }

    try {
        await prisma.$transaction(async (tx) => {
            const wellbeingCount = await tx.$executeRaw`
                UPDATE "Wellbeing" 
                SET "newBatchId" = br."newId"
                FROM "Batch_Record" br 
                WHERE "Wellbeing".batch_id = br.id
                AND "Wellbeing"."newBatchId" IS NULL
            `;

            const employeeCount = await tx.$executeRaw`
                UPDATE "Employee_Under_Batch"
                SET "newBatchId" = br."newId" 
                FROM "Batch_Record" br
                WHERE "Employee_Under_Batch".batch_id = br.id
                AND "Employee_Under_Batch"."newBatchId" IS NULL
            `;

            const adviceCount = await tx.$executeRaw`
                UPDATE "UserAdvice"
                SET "newBatchCreated" = br."newId" 
                FROM "Batch_Record" br
                WHERE "UserAdvice".batch_created = br.id
                AND "UserAdvice"."newBatchCreated" IS NULL
            `;

            console.log(`Wellbeing Count: ${wellbeingCount}. EUB Count: ${employeeCount}. Advice Count: ${adviceCount}`)
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