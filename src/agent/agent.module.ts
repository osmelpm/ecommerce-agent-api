import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { OrdersModule } from 'src/orders/orders.module';
import { ProductsModule } from 'src/products/products.module';
import { ReturnsModule } from 'src/returns/returns.module';
import { SupportModule } from 'src/support/support.module';

@Module({
  imports: [OrdersModule, ProductsModule, ReturnsModule, SupportModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
