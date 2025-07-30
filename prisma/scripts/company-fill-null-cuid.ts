// import { PrismaClient } from "@prisma/client";
// import cuid = require('cuid');

// const prisma = new PrismaClient()


// async function main() {
//     const companies = await prisma.company.findMany({
//         where: { newId: null }
//     })

//     for (const company of companies) {
//         const newId = cuid()
//         await prisma.company.update({
//             where: { id: company.id },
//             data: { newId }
//         })
//     }
//     console.log(` Filled ${companies.length} companies with newId`)
// }

// main()
//     .catch((e) => {
//         console.error('Migration failed:', e)
//         process.exit(1)
//     })
//     .finally(async () => {
//         await prisma.$disconnect()
//     })