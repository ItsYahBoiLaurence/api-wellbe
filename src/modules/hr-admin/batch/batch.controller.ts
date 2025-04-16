import { Controller, Get, Query } from '@nestjs/common';
import { BatchService } from './batch.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { UserQuery } from 'src/types/user';

@Controller('batch')
export class BatchController {

    constructor(
        private readonly batchService: BatchService,
    ) { }

    @Get()
    startBatch(@Query('company') company: string) {
        return this.batchService.startBatch(company)
    }

}
