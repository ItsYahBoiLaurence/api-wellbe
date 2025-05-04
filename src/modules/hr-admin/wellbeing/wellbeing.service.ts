import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JsonValue } from '@prisma/client/runtime/library';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DomainStats } from 'src/types/answer';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class WellbeingService {
    constructor(private readonly helper: HelperService, private readonly prisma: PrismaService) { }

    async generateUserWellbeing(user: JwtPayload) {

        const start = new Date()
        start.setHours(start.getHours() + 8)

        const { company, sub } = user

        const latest_batch = await this.helper.getLatestBatch(company)

        const user_batch_data = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                email: sub,
                batch_id: latest_batch.id
            },
        })

        if (!user_batch_data) throw new NotFoundException("No Batch Available!")
        if (user_batch_data.is_completed === false) throw new ConflictException("Incomplete user data. Cannot generate Report!")

        const user_answers = await this.prisma.answer.findMany({
            where: {
                employee_id: user_batch_data.id
            }, select: {
                answer: true
            }
        })

        if (!user_answers) throw new NotFoundException("User has no Answer!")

        const wellbeing_score = this.compute_wellbeing(user_answers);

        const wellbeing = await this.prisma.wellbeing.create({
            data: {
                user_email: user_batch_data.email,
                created_at: start,
                wellbeing_score,
                batch_id: latest_batch.id
            }
        })



        if (!wellbeing) throw new ConflictException("Error saving score!")

        return { message: "Successful wellbeing score generation!" }
    }

    async getUserWellbeing(user_details: JwtPayload) {

        const { sub } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const score = await this.prisma.wellbeing.findFirst({
            where: {
                user_email: user.email
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!score) throw new NotFoundException("Score not found!")

        return score.wellbeing_score
    }

    private compute_wellbeing(user_answers: { answer: JsonValue }[]) {
        const domains: Record<string, DomainStats> = {
            character: { sum: 0, count: 0 },
            career: { sum: 0, count: 0 },
            connectedness: { sum: 0, count: 0 },
            contentment: { sum: 0, count: 0 },
        };

        user_answers.forEach(({ answer }) => {
            // Inline loop over each answer array—still overall O(N)
            for (const qa of answer as Record<string, number>[]) {
                const key = Object.keys(qa)[0];
                const val = qa[key];
                const id = +key;

                // Determine domain in one conditional tree
                let bucket: DomainStats;
                if (id < 200) bucket = domains.character;
                else if (id < 300) bucket = domains.career;
                else if (id < 400) bucket = domains.connectedness;
                else bucket = domains.contentment;

                bucket.sum += val;
                bucket.count += 1;
            }
        });

        // Compute percentage scores (truncated) in one go
        const result = Object.fromEntries(
            Object.entries(domains).map(([domain, { sum, count }]) => {
                const pct = count > 0 ? Math.floor((sum / (count * 4)) * 100) : 0;
                return [domain, pct];
            })
        ) as Record<string, number>;

        return result
    }
} 
