import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateMajorDto } from './create-major.dto';
import { IsOptional } from 'class-validator';

export class UpdateMajorDto extends PartialType(CreateMajorDto) {
  @ApiPropertyOptional({ example: 'This is a name', type: String })
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ example: 'This is an image', type: String })
  @IsOptional()
  image: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 'This is a avatar', type: String })
  @IsOptional()
  avatar: string;
}
