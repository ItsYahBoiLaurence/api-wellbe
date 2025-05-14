import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { SettingsPayload } from 'src/types/settings';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingService: SettingsService) { }


    @Get()
    getSettings(@CurrentUser() user_data: JwtPayload) {
        return this.settingService.getSettings(user_data)
    }

    @Patch()
    settingConfig(@CurrentUser() user_data: JwtPayload, @Body() frequency: SettingsPayload) {
        return this.settingService.updateSettings(user_data, frequency)
    }
}
