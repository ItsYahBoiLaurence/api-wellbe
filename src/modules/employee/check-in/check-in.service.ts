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

        const latest_batch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name: company
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!latest_batch) return {
            is_batch_available: false,
            check_in_count: null,
            has_pending_questions: null,
            is_user_finished: null,
            next_check_in_date: null
        }

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

        if (!employee_progress) return {
            is_batch_available: false,
            check_in_count: null,
            has_pending_questions: null,
            is_user_finished: null,
            next_check_in_date: null
        }
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

    async getUserStatus(user_details: JwtPayload) {

        const { sub, company } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const latest_batch = await this.helper.getLatestBatch(company)

        const employee_progress = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                batch_id: latest_batch.id,
                email: user.email
            }, select: {
                set_participation: true,
            }
        })

        if (!employee_progress) throw new ConflictException("User is not included to the batch!")

        const check_ins: { id: number, check_in_date: string, status: boolean }[] = []

        this.logger.log(latest_batch)
        this.logger.log(employee_progress.set_participation)

        const startDate = latest_batch.start_date
        const frequency = latest_batch.frequency
        const daysToAdd = frequency == "DAILY" ? 1 : frequency == "WEEKLY" ? 7 : 0

        if (Array.isArray(employee_progress.set_participation)) {
            const participation = [...employee_progress.set_participation as []]
            participation.forEach((set, index) => {
                const date = new Date(startDate)
                date.setDate(date.getDate() + ((index * daysToAdd) - 1))
                check_ins.push({
                    id: index + 1,
                    check_in_date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                    status: set
                })
            })
        }



        return {
            current_quick_check: latest_batch.current_set_number,
            check_ins
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