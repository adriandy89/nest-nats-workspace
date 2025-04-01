import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Todo } from '@prisma/client';
import { CreateTodoDto, UpdateTodoDto } from '@app/dtos';
// import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTodoDto): Promise<Todo> {
    return this.prisma.todo.create({ data });
  }

  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  async findOne(id: number): Promise<Todo | null> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      console.error(`[Todo Service] Todo with ID ${id} not found`);
      // throw new RpcException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: number, data: UpdateTodoDto): Promise<Todo | null> {
    try {
      return await this.prisma.todo.update({
        where: { id },
        data,
      });
    } catch (error) {
      // eslint-disable-next-line
      if (error?.code === 'P2025') {
        console.error(`[Todo Service] Todo with ID ${id} not found for update`);
        // throw new RpcException(`Todo with ID ${id} not found`);
        return null;
      }
      console.error(`[Todo Service] Error updating todo ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number): Promise<Todo | null> {
    try {
      return await this.prisma.todo.delete({ where: { id } });
    } catch (error) {
      // eslint-disable-next-line
      if (error?.code === 'P2025') {
        console.error(
          `[Todo Service] Todo with ID ${id} not found for deletion`,
        );
        // throw new RpcException(`Todo with ID ${id} not found`);
        return null;
      }
      console.error(`[Todo Service] Error deleting todo ${id}:`, error);
      throw error;
    }
  }
}
