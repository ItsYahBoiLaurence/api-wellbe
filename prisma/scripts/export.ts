import { Logger, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { raw } from "@prisma/client/runtime/library";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

interface RawAnswerModel {
    id: string;
    answer: Record<string, number>[];
    employee_id: string;
}

interface TransformedUserData extends Record<string, number | string> {
    user_id: string;
}

function transformAndGroupData(rawAnswers: RawAnswerModel[]): TransformedUserData[] {
    const userRecords = new Map<string, TransformedUserData>();

    for (const item of rawAnswers) {
        let userRecord = userRecords.get(item.employee_id);
        if (!userRecord) {
            userRecord = { user_id: item.employee_id };
            userRecords.set(item.employee_id, userRecord);
        }

        for (const answerObj of item.answer) {
            Object.assign(userRecord, answerObj);
        }
    }

    return Array.from(userRecords.values());
}

async function main() {
    try {
        const latestBatch = await prisma.batch_Record.findFirst({
            where: {
                company_name: "Positive Workplaces"
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true
            }
        });

        if (!latestBatch) {
            throw new NotFoundException("No batch found");
        }

        const rawAnswers = await prisma.answer.findMany({
            where: {
                employee: {
                    batch_id: latestBatch.id,
                    is_completed: true
                }
            },
            select: {
                id: true,
                answer: true,
                employee_id: true
            }
        });
        const transformedData = transformAndGroupData(rawAnswers as RawAnswerModel[]);
        const jsonData = JSON.stringify(transformedData, null, 2)
        writeFileSync('answers.json', jsonData)
        Logger.log('Data exported successfully to answers.json');

    } catch (error) {
        Logger.error('Error in main function:', error);
        throw error;
    }
    const eub = await prisma.employee_Under_Batch.findMany({
        where: {
            batch_id: "cmdpnvtpd0004xi0che9b2qb5"
        },

    })
    console.log(eub.length)
}

main()
    .catch((e) => {
        console.error('Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })