import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@stoicpiggy/shared';

@Injectable()
export class AppService {
  getInfo(): { name: string; status: string } {
    return { name: APP_NAME, status: 'ok' };
  }
}
