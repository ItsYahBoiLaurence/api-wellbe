import { PrismaClient } from "@prisma/client";
import { exit } from "process";

const prisma = new PrismaClient()

type Score = {
    character: number,
    career: number,
    connectedness: number,
    contentment: number
}

type Wellbe = {
    wellbeing_score: Score
    user_email: string
    created_at: string
    department: string
    batch_id: string
    id: string
}

async function main() {

    const wellb = await prisma.wellbeing.findMany({
        where: {
            batch_id: 'cmdpnvtpd0004xi0che9b2qb5'
        }
    })

    const wellbeings = (wellb as unknown) as Wellbe[]

    if (!wellbeings) throw new Error("No wellbeing data")

    // const generated_wellbeing: Score[] = []



    const Score = {
        career: 0,
        character: 0,
        contentment: 0,
        connectedness: 0
    }

    for (const wellbe of wellbeings) {
        Score.career += wellbe.wellbeing_score.career
        Score.character += wellbe.wellbeing_score.character
        Score.connectedness += wellbe.wellbeing_score.connectedness
        Score.contentment += wellbe.wellbeing_score.contentment
    }

    const finalScore = {
        career: Score.career / wellbeings.length,
        character: Score.character / wellbeings.length,
        contentment: Score.contentment / wellbeings.length,
        connectedness: Score.connectedness / wellbeings.length
    }

    console.log(finalScore)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })