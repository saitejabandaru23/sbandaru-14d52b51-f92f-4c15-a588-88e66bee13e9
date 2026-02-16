import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './app/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the dashboard dev-server to call the API in case proxy is not used.
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Seed a demo account for immediate login in the dashboard.
  try {
    const auth = app.get(AuthService);
    await auth.register('sai@test.com', '123456', 'Sai');
  } catch {
    // Ignore if it already exists.
  }

  await app.listen(3000);
}
bootstrap();
