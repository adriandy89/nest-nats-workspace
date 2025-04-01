import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma client connected successfully.');
    } catch (error) {
      console.error('Failed to connect Prisma client:', error);
    }
  }

  // Optional: You can use this method to enable graceful shutdown hooks for Prisma

  enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line
    process.on('beforeExit', async () => {
      console.log('Closing Prisma connection...');
      await this.$disconnect();
      await app.close();
    });
  }
}
