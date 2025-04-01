import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Complete project documentation',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Additional details about the todo item',
    example: 'Write technical documentation for the API endpoints',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the todo item is completed',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
