import { Injectable } from '@nestjs/common';
import { HelloResponseDto } from './app.controller';

@Injectable()
export class AppService {
  getHello(): HelloResponseDto {
    return {
      message: 'Hello World!',
    };
  }
}
