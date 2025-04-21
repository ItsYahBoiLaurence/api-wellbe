import { Controller, Get, Query } from '@nestjs/common';
import { BatchService } from './batch.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { UserQuery } from 'src/types/user';
import { JwtPayload } from 'src/types/jwt-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('batch')
export class BatchController {

    constructor(
        private readonly batchService: BatchService,
    ) { }

    @Get()
    startBatch(@CurrentUser() user_data: JwtPayload) {
        return this.batchService.startBatch(user_data)
    }

}
