import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Module({
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
