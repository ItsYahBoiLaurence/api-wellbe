import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class CheckInService {

    private logger = new Logger(CheckInService.name)

    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

    async getUserCheckInStatus(user_details: JwtPayload) {

        const { sub, company } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const latest_batch = await this.helper.getLatestBatch(company)

        if (latest_batch.is_completed === true) return {
            is_batch_available: false,
            check_in_count: null,
            has_pending_questions: null,
            is_user_finished: null,
            next_check_in_date: null
        }

        //is user has pending questions
        const employee_progress = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                batch_id: latest_batch.id,
                email: user.email
            }, select: {
                set_participation: true,
                is_completed: true
            }
        })

        if (!employee_progress) throw new ConflictException("User is not included to the batch!")

        const hasPendingQuestion = this.hasMissedQuestions(employee_progress.set_participation as [], latest_batch.current_set_number)

        const frequency = latest_batch.frequency
        const daysToAdd = frequency == "DAILY" ? 1 : frequency == "WEEKLY" ? 7 : 0
        const batch_start_date = latest_batch.created_at

        this.logger.log(latest_batch)

        const date = new Date(batch_start_date)
        const nextAvailableQuickCheck = latest_batch.current_set_number === 5
            ? null
            : this.addDays(date, latest_batch.current_set_number * daysToAdd)

        return {
            has_pending_questions: hasPendingQuestion,
            next_check_in_date: nextAvailableQuickCheck,
            is_batch_available: !latest_batch.is_completed,
            check_in_count: latest_batch.current_set_number,
            user_finished_the_batch: employee_progress.is_completed,
            deadline_date: latest_batch.end_date
        }
    }

    private hasMissedQuestions(arr: [], current_set_number: number) {
        for (let i = 0; i < current_set_number; i++) {
            if (arr[i] === false) {
                return true
            }
        }
        return false
    }

    private addDays(date: Date, days: number) {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }
}