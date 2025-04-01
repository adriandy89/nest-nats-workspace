/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientNats } from '@nestjs/microservices';
import { CreateTodoDto } from '@app/dtos/create-todo.dto';
import { UpdateTodoDto } from '@app/dtos/update-todo.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let clientNatsMock: jest.Mocked<ClientNats>;

  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    completed: false,
  };

  beforeEach(async () => {
    clientNatsMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        {
          provide: 'TODO_SERVICE',
          useValue: clientNatsMock,
        },
      ],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
    await controller.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should connect successfully', async () => {
      expect(clientNatsMock.connect).toHaveBeenCalled();
    });

    it('should handle connection error', async () => {
      clientNatsMock.connect.mockRejectedValueOnce(
        new Error('Connection failed'),
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await new ApiGatewayController(clientNatsMock).onModuleInit();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto: CreateTodoDto = { title: 'New Todo', completed: false };
      clientNatsMock.send.mockReturnValueOnce(of(mockTodo));

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTodo);
      expect(clientNatsMock.send).toHaveBeenCalledWith(
        'todo.create',
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const todos = [mockTodo];
      clientNatsMock.send.mockReturnValueOnce(of(todos));

      const result = await controller.findAll();

      expect(result).toEqual(todos);
      expect(clientNatsMock.send).toHaveBeenCalledWith('todo.findAll', {});
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      clientNatsMock.send.mockReturnValueOnce(of(mockTodo));

      const result = await controller.findOne(1);

      expect(result).toEqual(mockTodo);
      expect(clientNatsMock.send).toHaveBeenCalledWith('todo.findOne', {
        id: 1,
      });
    });

    it('should throw NotFoundException when todo not found', async () => {
      clientNatsMock.send.mockReturnValueOnce(of(null));

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto: UpdateTodoDto = { completed: true };
      clientNatsMock.send.mockReturnValueOnce(
        of({ ...mockTodo, ...updateDto }),
      );

      const result = await controller.update(1, updateDto);

      expect(result).toEqual({ ...mockTodo, ...updateDto });
      expect(clientNatsMock.send).toHaveBeenCalledWith('todo.update', {
        id: 1,
        data: updateDto,
      });
    });

    it('should throw NotFoundException when todo not found for update', async () => {
      clientNatsMock.send.mockReturnValueOnce(of(null));

      await expect(controller.update(1, { completed: true })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      clientNatsMock.send.mockReturnValueOnce(of(mockTodo));

      await controller.remove(1);

      expect(clientNatsMock.send).toHaveBeenCalledWith('todo.remove', {
        id: 1,
      });
    });

    it('should throw NotFoundException when todo not found for deletion', async () => {
      clientNatsMock.send.mockReturnValueOnce(of(null));

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      clientNatsMock.send.mockReturnValueOnce(
        throwError(() => new Error('Timeout')),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
