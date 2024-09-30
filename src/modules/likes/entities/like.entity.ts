import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class Like {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  liked_by?: string;
}
