import { Module } from '@nestjs/common';
import { MAIL_TRANSPORT, MailService } from './mail.service';
import { createMailTransport } from './mail.transport';

@Module({
  providers: [MailService, { provide: MAIL_TRANSPORT, useFactory: createMailTransport }],
  exports: [MailService],
})
export class MailModule {}
