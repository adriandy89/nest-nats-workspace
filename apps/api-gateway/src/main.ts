import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('API_GATEWAY_PORT') || 3000;
  const natsUrl = configService.get<string>('NATS_URL');

  if (!natsUrl) {
    throw new Error(
      'NATS_URL environment variable is not set for the API Gateway.',
    );
  }

  app.use(helmet());
  app.enableCors();

  app.setGlobalPrefix('api');

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

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('The API Gateway description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory);

  await app.listen(port);
  console.log(`API Gateway is running on: http://localhost:${port}`);
  console.log(`API Gateway connected to NATS (${natsUrl})`);
}
// eslint-disable-next-line
bootstrap();
