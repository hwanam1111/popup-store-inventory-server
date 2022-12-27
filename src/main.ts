import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';

import { AppModule } from '@src/app.module';
import { HttpExceptionFilter } from '@src/common/http-exception-filter';

async function bootstrap() {
  morgan.token('date', function () {
    return new Date().toLocaleString();
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'prod' ? [process.env.WEB_FRONT_URL] : true,
    credentials: true,
  });
  app.use(
    morgan(
      process.env.NODE_ENV === 'prod'
        ? 'combined'
        : 'Method: :method\nStatus: :status\nUrl: :url\nRequest Time: :response-time ms\nUser: :remote-addr - :remote-user\nDate: :date\n--------------',
    ),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.SERVER_PORT);
}

bootstrap();
