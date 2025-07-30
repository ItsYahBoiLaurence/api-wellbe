// import { PrismaClient } from "@prisma/client";
// import cuid = require('cuid')

// const prisma = new PrismaClient()

// async function main() {
//     // const departments = await prisma.department.findMany({
//     //     where: {
//     //         newId: null
//     //     }
//     // })

//     // for (const department of departments) {
//     //     const newId = cuid()
//     //     await prisma.department.update({
//     //         where: {
//     //             id: department.id
//     //         },
//     //         data: {
//     //             newId
//     //         }
//     //     })
//     // }
//     // console.log(`Updated ${departments.length} records in department table`)

//     const departments = await prisma.department.findMany()

//     for (const department of departments) {
//         await Promise.all([
//             await prisma.employee.updateMany({
//                 where: {
//                     department_id: department.id
//                 },
//                 data: {
//                     newDepartmentId: department.newId
//                 }
//             }),
//             await prisma.wellbeing.updateMany({
//                 where: {
//                     department: department.id
//                 },
//                 data: {
//                     newDepartment: department.newId
//                 }
//             })
//         ])
//     }

// }

// main()
//     .catch((e) => {
//         console.error('Migration failed:', e)
//         process.exit(1)
//     })
//     .finally(async () => {
//         await prisma.$disconnect()
//     })