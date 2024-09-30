import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    type: String,
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ example: 'this is a name', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'this is a desc', type: String })
  @IsOptional()
  @IsString()
  description?: string;
}
