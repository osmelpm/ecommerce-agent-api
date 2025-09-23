import { Module } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';

@Module({
  providers: [HelpdeskService],
  exports: [HelpdeskService],
})
export class SupportModule {}
