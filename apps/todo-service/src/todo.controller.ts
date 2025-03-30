import { Controller, ValidationPipe, UsePipes } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  NatsContext,
} from '@nestjs/microservices';
import { TodoService } from './todo.service';
import { Todo } from '@prisma/client';
import { CreateTodoDto } from '@app/dtos/create-todo.dto';
import { UpdateTodoDto } from '@app/dtos/update-todo.dto';

@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @MessagePattern('todo.create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Payload() createTodoDto: CreateTodoDto,
    @Ctx() context: NatsContext,
  ): Promise<Todo> {
    console.log(`[Todo Service] Received message on ${context.getSubject()}`);
    return this.todoService.create(createTodoDto);
  }

  @MessagePattern('todo.findAll')
  async findAll(@Ctx() context: NatsContext): Promise<Todo[]> {
    console.log(`[Todo Service] Received message on ${context.getSubject()}`);
    return this.todoService.findAll();
  }

  @MessagePattern('todo.findOne')
  async findOne(
    @Payload() payload: { id: number },
    @Ctx() context: NatsContext,
  ): Promise<Todo | null> {
    console.log(
      `[Todo Service] Received message on ${context.getSubject()} for ID: ${payload.id}`,
    );
    const id =
      typeof payload.id === 'string' ? parseInt(payload.id, 10) : payload.id;
    if (isNaN(id)) {
      console.error('Invalid ID received');
      return null;
    }
    return this.todoService.findOne(id);
  }

  @MessagePattern('todo.update')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    }),
  )
  async update(
    @Payload() payload: { id: number; data: UpdateTodoDto },
    @Ctx() context: NatsContext,
  ): Promise<Todo | null> {
    console.log(
      `[Todo Service] Received message on ${context.getSubject()} for ID: ${payload.id}`,
    );
    const id =
      typeof payload.id === 'string' ? parseInt(payload.id, 10) : payload.id;
    if (isNaN(id)) {
      console.error('Invalid ID received for update');
      return null;
    }
    return this.todoService.update(id, payload.data);
  }

  @MessagePattern('todo.remove')
  async remove(
    @Payload() payload: { id: number },
    @Ctx() context: NatsContext,
  ): Promise<Todo | null> {
    console.log(
      `[Todo Service] Received message on ${context.getSubject()} for ID: ${payload.id}`,
    );
    const id =
      typeof payload.id === 'string' ? parseInt(payload.id, 10) : payload.id;
    if (isNaN(id)) {
      console.error('Invalid ID received for delete');
      return null;
    }
    return this.todoService.remove(id);
  }
}
