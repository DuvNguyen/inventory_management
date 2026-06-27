import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  console.warn(`API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
