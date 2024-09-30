import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty({ example: 'This is a name', type: String })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'This is an image', type: String })
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'This is a avatar', type: String })
  @IsOptional()
  avatar_url?: string;
}
