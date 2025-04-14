import { Controller, Get, Query } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {

    constructor(private readonly batchService: BatchService) { }

    @Get()
    startBatch(@Query('company') company: string) {
        return this.batchService.startBatch(company)
    }

}
