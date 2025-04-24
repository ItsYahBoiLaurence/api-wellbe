import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Frequency } from '@prisma/client';
import { HelperModule } from 'src/modules/helper/helper.module';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { SettingsPayload } from 'src/types/settings';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

    async updateSettings(user_details: JwtPayload, data_payload: SettingsPayload) {
        const { company, role } = user_details
        if (!data_payload) throw new BadRequestException("Invalid Payload")
        if (role === "employee") throw new ForbiddenException("You don't have permission to edit this!")
        try {
            const settings = await this.prisma.settings.update({
                where: {
                    config_id: company
                },
                data: {
                    frequency: data_payload.frequency
                }
            })
            if (!settings) throw new ConflictException("Settings configuration failed!")

            return { message: "Settings updated successfully" }

        } catch (error) {
            throw new ConflictException("Settings configuration failed!")
        }
    }
}
