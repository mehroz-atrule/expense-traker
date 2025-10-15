import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from './logger/logger.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // --- Core Services ---
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);


  // const clientUrl = configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
  // app.enableCors({
  //   origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  //   exposedHeaders: 'Content-Disposition',
  //   credentials: true,
  // });
  // // --- Global Prefix ---
  app.setGlobalPrefix('api');

  // --- CORS ---
  const clientUrl = configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
  app.enableCors({
    origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    exposedHeaders: 'Content-Disposition',
    credentials: true,
  });

  // --- Validation Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // --- Global Exception Filter ---
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // --- Global Guards ---
  // app.useGlobalGuards(
  //   new JwtAuthGuard(jwtService, configService),
  //   new RolesGuard(reflector),
  // );

  // --- Swagger Setup ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise Expense Tracker API')
    .setDescription('API documentation for the Expense Tracker project')
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // --- Start Server ---
  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT);

  logger.log(`Server running on http://localhost:${PORT}`);
  logger.log(`Swagger docs available on http://localhost:${PORT}/api/docs`);
}

bootstrap();
