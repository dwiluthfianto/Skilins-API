import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty({ example: 'Rekayasa Perangkat Lunak', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  @IsOptional()
  avatar_url?: string;
}
