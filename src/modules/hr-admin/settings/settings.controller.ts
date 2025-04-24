import { Body, Controller, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { SettingsPayload } from 'src/types/settings';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingService: SettingsService) { }

    @Patch()
    settingConfig(@CurrentUser() user_data: JwtPayload, @Body('frequency') frequency: SettingsPayload) {
        return this.settingService.updateSettings(user_data, frequency)
    }
}
