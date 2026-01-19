import { NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { NewAnswerModel } from "src/types/answer";
import { Score } from "src/types/wellbeing";

const prisma = new PrismaClient()

async function main() {


    const batches = await prisma.batch_Record.findMany()

    try {
        for (const batch of batches) {

            const eubs = await prisma.employee_Under_Batch.findMany({
                where: {
                    batch_id: batch.id,
                    is_completed: true
                }
            })

            for (const eub of eubs) {
                const [department, ans] = await Promise.all([
                    prisma.department.findFirst({
                        where: {
                            employees: {
                                some: {
                                    email: eub.email
                                },
                            },
                        },
                    }),
                    prisma.answer.findMany({
                        where: {
                            employee_id: eub.id
                        }
                    })
                ])

                if (!department) throw new NotFoundException('Department not Found')

                const answers = ans as NewAnswerModel[]

                if (answers.length === 0) {
                    throw new NotFoundException("No answers found for this employee!")
                }

                const flatMappedAnswers = answers.flatMap(answerRecord => answerRecord.answer)

                const domainScores: Score = {
                    character: 0,
                    career: 0,
                    connectedness: 0,
                    contentment: 0
                };

                const categoryMap: Record<string, keyof Score> = {
                    '1': 'character',
                    '2': 'career',
                    '3': 'contentment',
                    '4': 'connectedness'
                };

                flatMappedAnswers.forEach((answerData) => {
                    const [[key, value]] = Object.entries(answerData)
                    const category = key.charAt(0)
                    const domain = categoryMap[category]
                    if (domain) domainScores[domain] += value
                })

                await prisma.wellbeing.upsert({
                    where: {
                        user_email_batch_id: {
                            user_email: eub.email,
                            batch_id: batch.id
                        }
                    },
                    update: {
                        wellbeing_score: domainScores
                    },
                    create: {
                        created_at: batch.start_date,
                        user_email: eub.email,
                        batch_id: batch.id,
                        wellbeing_score: domainScores,
                        department: department.id
                    }
                })

                console.log(eub.id)
                console.log(domainScores)

            }
        }
    } catch (err) {
        console.log(err)
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