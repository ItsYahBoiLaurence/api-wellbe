import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConflictError } from 'openai';

import { CsvParcerService } from 'src/modules/csv-parcer/csv-parcer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class WorkforceVitalityService {
    constructor(
        private readonly parser: CsvParcerService,
        private readonly helper: HelperService,
        private readonly prisma: PrismaService) { }

    async getScatterplotData(file: Buffer, user_data: JwtPayload) {
        const { company } = user_data;
        const userCompany = await this.helper.getCompany(company);
        const csvData = await this.parser.parsePerformance(file);
        const latest_finished_batch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name: userCompany.name,
                is_completed: true
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!latest_finished_batch) throw new NotFoundException("No Batch Available!")

        const users_with_data: Array<{
            user: string;
            performance: number;
            wellbeing: number;
        }> = [];
        const users_without_data: string[] = [];

        // Use for...of so that each await is respected
        for (const { email, performance } of csvData as Array<{ email: string; performance: number }>) {
            const userWellbeing = await this.prisma.wellbeing.findFirst({
                where: {
                    user_email: email,
                    batch_id: latest_finished_batch.id,
                },
            });

            if (!userWellbeing) {
                users_without_data.push(email);
            } else {
                // wellbeing_score is a JSON object like { character, career, connectedness, contentment }
                const scoresObj = userWellbeing.wellbeing_score as Record<string, number>;
                const scoreValues = Object.values(scoresObj);
                const total = scoreValues.reduce((sum, val) => sum + val, 0);
                const avgWellbeing = total / scoreValues.length;

                users_with_data.push({
                    user: email,
                    performance,
                    wellbeing: avgWellbeing,
                });
            }
        }

        const createData = await this.prisma.scatterData.create({
            data: {
                created_at: this.helper.getCurrentDate(),
                scatterData: { users_with_data },
                company_name: userCompany.name
            }
        })

        if (!createData) throw new ConflictException("Scatter Plot data not generated!")

        return {
            users_with_data,
            users_without_data,
        };
    }

    async getScatter(user_data: JwtPayload) {
        const { company } = user_data
        const user_company = await this.helper.getCompany(company)
        const scatter = await this.prisma.scatterData.findFirst({
            where: {
                company_name: user_company.name
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                scatterData: true,
                created_at: true
            }
        })
        if (!scatter) throw new NotFoundException("Performance vs. Wellbeing Data not found!")
        return scatter
    }
}
