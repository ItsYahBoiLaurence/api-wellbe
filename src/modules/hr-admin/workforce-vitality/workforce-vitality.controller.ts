import { BadRequestException, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { WorkforceVitalityService } from './workforce-vitality.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('workforce-vitality')
export class WorkforceVitalityController {
    constructor(private readonly service: WorkforceVitalityService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    generateScatterplot(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File is missing!')
        return this.service.getScatterplotData(file.buffer, user)
    }
}
