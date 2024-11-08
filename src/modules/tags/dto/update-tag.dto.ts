import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    type: String,
  })
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({ example: 'this is a name', type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'this is a desc', type: String })
  @IsOptional()
  @IsString()
  description?: string;
}
