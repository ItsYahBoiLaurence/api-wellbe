// import { PrismaClient } from "@prisma/client";
// import { error } from "console";
// import cuid = require("cuid");


// const prisma = new PrismaClient();

// async function main() {
//     const inboxes = await prisma.inbox.findMany({
//         where: { newId: null }
//     })

//     for (const inbox of inboxes) {
//         const newId = cuid();
//         await prisma.inbox.update({
//             where: {
//                 id: inbox.id
//             },
//             data: {
//                 newId
//             }
//         })
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
