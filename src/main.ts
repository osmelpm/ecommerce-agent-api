import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './common/exceptions';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = envs.PORT ?? 3000;
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionsFilter());

  await app.listen(port, () => console.log(`Server running on port ${port}`));
}
bootstrap();
