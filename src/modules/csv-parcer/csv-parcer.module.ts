import { Module } from '@nestjs/common';
import { CsvParcerService } from './csv-parcer.service';

@Module({
  providers: [CsvParcerService],
  exports: [CsvParcerService]
})
export class CsvParcerModule { }
