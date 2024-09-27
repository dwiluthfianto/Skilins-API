import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fiction', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', type: String })
  @IsNotEmpty()
  avatar: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  @IsOptional()
  description?: string;
}
