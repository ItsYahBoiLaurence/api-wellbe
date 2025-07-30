// import { PrismaClient } from "@prisma/client";
// import cuid = require('cuid');

// const prisma = new PrismaClient()

// async function main() {
//     const employees = await prisma.employee.findMany({
//         where: { newId: null }
//     })

//     for (const employee of employees) {
//         const newId = cuid()
//         await prisma.employee.update({
//             where: { id: employee.id },
//             data: { newId }
//         })
//     }

//     console.log(` Filled ${employees.length} employees with newId`)
// }

// main()
//     .catch((e) => {
//         console.error('Migration failed:', e)
//         process.exit(1)
//     })
//     .finally(async () => {
//         await prisma.$disconnect()
//     })
