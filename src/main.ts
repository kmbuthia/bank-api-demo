import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('Bootstrap server');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*', // Change this for prod
      methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ],
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: configService.get('cache.host'),
      port: configService.get('cache.port'),
    },
  });
  await app.startAllMicroservices();

  const appPort = process.env.PORT ?? 3000;
  const appHost = process.env.HOST ?? '0.0.0.0';
  await app.listen(appPort, appHost);
  logger.log(`Loan Demo API running on port: ${appPort}`);
}
bootstrap();
