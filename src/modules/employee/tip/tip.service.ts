import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { OpenaiService } from 'src/modules/openai/openai.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class TipService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly ai: OpenaiService
    ) { }

    async getTip(user_details: JwtPayload) {

        const user = await this.helper.getUserByEmail(user_details.sub)

        const tipsBank = await this.prisma.tips.findMany({
            where: {
                user: user.email
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!tipsBank) throw new NotFoundException("Tips bank not found!")

        return tipsBank
    }

    async latestTip(user_details: JwtPayload) {

        const user = await this.helper.getUserByEmail(user_details.sub)

        const tip = await this.prisma.tips.findFirst({
            where: {
                user: user.email
            }, orderBy: {
                created_at: 'desc'
            }
        })

        if (!tip) throw new NotFoundException("Tip not Found!")

        return tip
    }

    async getHolisticTip(user_details: JwtPayload) {

        const { sub, company } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const latest_batch = await this.helper.getLatestBatch(company)

        const holistic_tip = await this.prisma.userAdvice.findUnique({
            where: {
                user_batch_created: {
                    user: user.email,
                    batch_created: latest_batch.id
                }
            }
        })

        if (!holistic_tip) throw new NotFoundException("Tip not found!")

        return holistic_tip
    }

    async generateHolisticTip(user_details: JwtPayload) {
        const { sub, company } = user_details

        const user = await this.helper.getUserByEmail(sub)
        const company_details = await this.helper.getCompany(company)

        const latest_batch = await this.helper.getLatestBatch(company_details.name)

        const user_batch_data = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                email: user.email,
                batch_id: latest_batch.id
            },
        })

        if (!user_batch_data) throw new NotFoundException("User not in current batch!")

        if (!user_batch_data.is_completed) throw new ConflictException("User record not completed!")

        const tips = await this.helper.getBatchTips(latest_batch.id, user.email)

        const wellbeing = await this.prisma.wellbeing.findFirst({
            where: {
                batch_id: latest_batch.id,
                user_email: user.email
            }
        })

        if (!wellbeing) throw new ConflictException("Wellbeing not generated!")

        const ai_tip = await this.ai.generateHolisticTip(tips, wellbeing)

        if (!ai_tip) throw new ConflictException("Error generating holistic tip!")

        const date = new Date
        date.setHours(date.getHours() + 8)

        const holistic_tip = await this.prisma.userAdvice.create({
            data: {
                user: user.email,
                advice: ai_tip,
                created_at: this.helper.getCurrentDate(),
                batch_created: latest_batch.id
            }
        })

        if (!holistic_tip) throw new ConflictException("Error saving Advice")

        return { message: "Successful holistic tip generation!" }
    }

    async getUserProgress(user_details: JwtPayload) {
        const { sub, company } = user_details

        const user = await this.helper.getUserByEmail(sub)
        const company_details = await this.helper.getCompany(company)

        const latest_batch = await this.helper.getLatestBatch(company_details.name)

        const batch_data = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                email: user.email,
                batch_id: latest_batch.id
            },
            select: {
                is_completed: true,
                set_participation: true
            }
        })

        if (!batch_data) throw new NotFoundException('Batch data not Found!')

        return batch_data
    }
}
