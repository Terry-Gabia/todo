import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend 서버가 포트 ${port}에서 실행 중입니다.`);
}

bootstrap();
