import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TodoModule } from './todo.module';
import { PrismaService } from '@app/database';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(TodoModule);
  const configService = app.get(ConfigService);

  const natsUrl = configService.get<string>('NATS_URL');
  if (!natsUrl) {
    throw new Error('NATS_URL environment variable is not set.');
  }

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(TodoModule, {
      transport: Transport.NATS,
      options: {
        servers: [natsUrl],
        queue: 'todo_queue',
      },
    });

  await microservice.listen();
  console.log(`Todo microservice is listening on NATS (${natsUrl})...`);

  // Optional: Enable shutdown hooks for graceful shutdown
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(microservice as any);
}
bootstrap();
