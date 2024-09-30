import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({ example: 'Fiction', type: String })
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    type: String,
  })
  avatar: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  description?: string;
}
