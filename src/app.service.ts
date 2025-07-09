import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    throw new NotFoundException('keme');
  }
}
