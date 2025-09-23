import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { OrdersModule } from './orders/orders.module';
import { ReturnsModule } from './returns/returns.module';
import { ProductsModule } from './products/products.module';
import { SupportModule } from './support/support.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(envs.MONGO_URI, {
      dbName: envs.DATABASE_NAME,
    }),
    AgentModule,
    OrdersModule,
    ReturnsModule,
    ProductsModule,
    SupportModule,
  ],
})
export class AppModule {}
