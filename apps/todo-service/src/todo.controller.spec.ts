/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { NatsContext } from '@nestjs/microservices';
import { CreateTodoDto } from '@app/dtos/create-todo.dto';
import { UpdateTodoDto } from '@app/dtos/update-todo.dto';

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: jest.Mocked<TodoService>;
  let mockNatsContext: jest.Mocked<NatsContext>;

  const mockTodo: {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  } = {
    id: 1,
    title: 'Test Todo',
    completed: false,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    todoService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<TodoService>;

    mockNatsContext = {
      getSubject: jest.fn().mockReturnValue('test.subject'),
    } as unknown as jest.Mocked<NatsContext>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: todoService,
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto: CreateTodoDto = { title: 'New Todo', completed: false };
      todoService.create.mockResolvedValue(mockTodo);

      const result = await todoController.create(createDto, mockNatsContext);

      expect(result).toEqual(mockTodo);
      expect(todoService.create).toHaveBeenCalledWith(createDto);
      expect(mockNatsContext.getSubject).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const todos = [mockTodo];
      todoService.findAll.mockResolvedValue(todos);

      const result = await todoController.findAll(mockNatsContext);

      expect(result).toEqual(todos);
      expect(todoService.findAll).toHaveBeenCalled();
      expect(mockNatsContext.getSubject).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      todoService.findOne.mockResolvedValue(mockTodo);

      const result = await todoController.findOne({ id: 1 }, mockNatsContext);

      expect(result).toEqual(mockTodo);
      expect(todoService.findOne).toHaveBeenCalledWith(1);
      expect(mockNatsContext.getSubject).toHaveBeenCalled();
    });

    it('should handle string id', async () => {
      todoService.findOne.mockResolvedValue(mockTodo);

      await todoController.findOne({ id: '1' as any }, mockNatsContext);

      expect(todoService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null for invalid id', async () => {
      const result = await todoController.findOne(
        { id: 'invalid' as any },
        mockNatsContext,
      );

      expect(result).toBeNull();
      expect(todoService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto: UpdateTodoDto = { completed: true };
      const updatedTodo = { ...mockTodo, ...updateDto };
      todoService.update.mockResolvedValue(updatedTodo);

      const result = await todoController.update(
        { id: 1, data: updateDto },
        mockNatsContext,
      );

      expect(result).toEqual(updatedTodo);
      expect(todoService.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockNatsContext.getSubject).toHaveBeenCalled();
    });

    it('should return null for invalid id', async () => {
      const result = await todoController.update(
        { id: 'invalid' as any, data: { completed: true } },
        mockNatsContext,
      );

      expect(result).toBeNull();
      expect(todoService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      todoService.remove.mockResolvedValue(mockTodo);

      const result = await todoController.remove({ id: 1 }, mockNatsContext);

      expect(result).toEqual(mockTodo);
      expect(todoService.remove).toHaveBeenCalledWith(1);
      expect(mockNatsContext.getSubject).toHaveBeenCalled();
    });

    it('should return null for invalid id', async () => {
      const result = await todoController.remove(
        { id: 'invalid' as any },
        mockNatsContext,
      );

      expect(result).toBeNull();
      expect(todoService.remove).not.toHaveBeenCalled();
    });
  });
});
