import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class ParticipationRateService {
    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

    private computeParticipationRate(
        completedCount: number,
        totalCount: number,
    ): number {
        // toFixed(2) returns a string; Number(...) converts back to a numeric value :contentReference[oaicite:5]{index=5}
        return totalCount > 0
            ? Number((completedCount / totalCount).toFixed(2))
            : 0;
    }
    // Main method: fetches latest batch, optional department filter, counts, and returns rate
    async getParticipationRate(
        user_data: JwtPayload,
        department?: string,
    ) {
        const { company } = user_data;

        try {

            const latest_batch = await this.helper.getLatestBatch(company);

            const commonFilters: any = { batch_id: latest_batch.id };

            let departmentName = 'Overall';

            if (department) {
                const dept = await this.helper.getDepartment(company, department);
                commonFilters.department_id = dept.id;
                departmentName = dept.name;
            }


            const [totalCount, completedCount] = await Promise.all([
                this.prisma.employee_Under_Batch.count({ where: commonFilters }),                           // COUNT(*) query :contentReference[oaicite:8]{index=8}
                this.prisma.employee_Under_Batch.count({ where: { ...commonFilters, is_completed: true } }), // COUNT(*) with filter :contentReference[oaicite:9]{index=9}
            ]);

            const participation_rate = this.computeParticipationRate(
                completedCount,
                totalCount,
            );

            return { department: departmentName, participation_rate };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
        }
    }














}
