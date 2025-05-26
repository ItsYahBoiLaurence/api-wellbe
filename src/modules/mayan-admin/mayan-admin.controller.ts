import { Body, Controller, Get, Logger, NotFoundException, Post, Query, } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CronService } from '../cron/cron.service';
import { EmailerService } from '../emailer/emailer.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { HelperService } from '../helper/helper.service';
import { AnswerModel } from 'src/types/answer';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';


@Controller('mayan-admin')
export class MayanAdminController {
    constructor(
        private readonly service: MayanAdminService,
        private readonly cron: CronService,
        private readonly emailer: EmailerService,
        private readonly helper: HelperService,
        private readonly ai: OpenaiService,
        private readonly prisma: PrismaService
    ) { }

    @Post()
    getSettings(@CurrentUser() user: JwtPayload, @Body() data: AnswerModel[]) {
        const { company, sub } = user
        return this.helper.getAdviceForUser(data)
    }

    @Get()
    async generateAiResponse(@CurrentUser() user_details: JwtPayload, @Query('company') company: string) {
        return this.helper.getCompany(company)
    }

    @Get('test')
    async testing(@CurrentUser() user: JwtPayload) {
        const { sub } = user
        const user_data = await this.prisma.employee.findUnique({
            where: {
                email: sub
            }
        })

        return user_data
    }
}
