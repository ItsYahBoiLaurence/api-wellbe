import { PrismaClient } from "@prisma/client";
import cuid = require("cuid");

const prisma = new PrismaClient();

async function main() {
    // const wbs = await prisma.wellbeing.findMany({
    //     where: {
    //         newId: null
    //     }
    // });

    // for (const wb of wbs) {
    //     const newId = cuid()
    //     await prisma.wellbeing.update({
    //         where: {
    //             id: wb.id
    //         },
    //         data: {
    //             newId
    //         }
    //     })
    // }

    // const uas = await prisma.userAdvice.findMany({
    //     where: {
    //         newId: null
    //     }
    // });

    // for (const ua of uas) {
    //     const newId = cuid()
    //     await prisma.userAdvice.update({
    //         where: {
    //             id: ua.id
    //         },
    //         data: {
    //             newId
    //         }
    //     })
    // }

    //     const answers = await prisma.answer.findMany({
    //         where: {
    //             newId: null
    //         }
    //     })

    //     for (const answer of answers) {
    //         const newId = cuid()
    //         await prisma.answer.update({
    //             where: {
    //                 id: answer.id
    //             },
    //             data: {
    //                 newId
    //             }
    //         })
    //     }

    // const tips = await prisma.tips.findMany({
    //     where: {
    //         newId: null
    //     }
    // })

    // for (const tip of tips) {
    //     const newId = cuid()
    //     await prisma.tips.update({
    //         where: {
    //             id: tip.id
    //         },
    //         data: {
    //             newId
    //         }
    //     })
    // }
}

main()
    .catch((e) => {
        console.error('Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })