import { CreateTodoDto, UpdateTodoDto } from '@app/dtos';
import {
  Controller,
  Inject,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  OnModuleInit,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';

@ApiTags('todos')
@Controller('todos')
export class ApiGatewayController implements OnModuleInit {
  constructor(@Inject('TODO_SERVICE') private readonly client: ClientNats) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('NATS client connected successfully in TodoController.');
    } catch (err) {
      console.error('Failed to connect NATS client in TodoController:', err);
    }
  }

  private async sendMessage<TResult = unknown, TInput = unknown>(
    pattern: string,
    payload: TInput,
  ): Promise<TResult> {
    try {
      const result = await firstValueFrom(
        this.client.send<TResult, TInput>(pattern, payload).pipe(
          timeout(8000),
          catchError((err) => {
            console.error(
              `Error communicating with microservice for pattern ${pattern}:`,
              err,
            );
            return throwError(
              () =>
                new InternalServerErrorException(
                  'Microservice communication error',
                ),
            );
          }),
        ),
      );
      return result;
    } catch (error) {
      console.error(`Error during microservice call for ${pattern}:`, error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to process request via microservice',
      );
    }
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    return this.sendMessage('todo.create', createTodoDto);
  }

  @Get()
  async findAll() {
    return this.sendMessage('todo.findAll', {});
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const todo = await this.sendMessage('todo.findOne', { id });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    const updatedTodo = await this.sendMessage('todo.update', {
      id,
      data: updateTodoDto,
    });
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found for update`);
    }
    return updatedTodo;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletedTodo = await this.sendMessage('todo.remove', { id });
    if (!deletedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found for deletion`);
    }
  }
}
