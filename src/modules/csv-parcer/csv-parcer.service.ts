import { Injectable } from '@nestjs/common';
import neatCsv from 'neat-csv';
import { InviteItem } from 'src/types/invite';

@Injectable()
export class CsvParcerService {
    async parseCsv(buffer: Buffer): Promise<InviteItem[]> {
        const csvString = buffer.toString('utf-8')
        return neatCsv(csvString, {
            skip_empty_lines: true,
            mapHeaders: ({ header }) => header
                .trim()                     // remove surrounding whitespace
                .toLowerCase()              // make lowercase
                .replace(/\s+/g, '_'),
        } as any);
    }


    async parsePerformance(buffer: Buffer): Promise<any> {
        const csvString = buffer.toString('utf-8')
        return neatCsv(csvString, {
            skip_empty_lines: true,
            mapHeaders: ({ header }) => header
                .trim()                     // remove surrounding whitespace
                .toLowerCase()              // make lowercase
                .replace(/\s+/g, '_'),
        } as any);
    }
}
