import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/todo-service/.env',
    }),
    DatabaseModule,
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
