// import { PrismaClient } from "@prisma/client";
// import cuid = require('cuid');

// const prisma = new PrismaClient()

// async function main() {
//     const eubs = await prisma.employee_Under_Batch.findMany({
//         where: { newId: null }
//     })

//     console.log(eubs)

//     for (const eub of eubs) {
//         const newId = cuid()
//         await prisma.employee_Under_Batch.update({
//             where: { id: eub.id },
//             data: { newId }
//         })
//     }

//     console.log(` Filled ${eubs.length} employees with newId`)
// }

// main()
//     .catch((e) => {
//         console.error('Migration failed:', e)
//         process.exit(1)
//     })
//     .finally(async () => {
//         await prisma.$disconnect()
//     })
