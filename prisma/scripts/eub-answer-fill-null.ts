import { PrismaClient } from "@prisma/client";
import cuid = require('cuid');

const prisma = new PrismaClient()

async function main() {
    // const eubs = await prisma.employee_Under_Batch.findMany()

    // for (const eub of eubs) {
    //     await prisma.answer.updateMany({
    //         where: {
    //             new_employee_id: eub.newId
    //         },
    //         data: {
    //             employee_id: eub.id
    //         }
    //     })
    // }

    // for (const eub of eubs) {
    //     await prisma.answer.updateMany({
    //         where: {
    //             employee_id: eub.id
    //         },
    //         data: {
    //             new_employee_id: eub.newId
    //         }
    //     })
    // }

    // const departments = await prisma.department.findMany()

    // for (const department of departments) {
    //     await prisma.employee_Under_Batch.updateMany({
    //         where: {
    //             department_id: department.idToRef
    //         },
    //         data: {
    //             newDepartmentId: department.id
    //         }
    //     })
    // }


    console.log('Completed!')
}

main()
    .catch((e) => {
        console.error('Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })