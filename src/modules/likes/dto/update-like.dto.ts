import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLikeDto } from './create-like.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLikeDto extends PartialType(CreateLikeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  liked_by?: string;
}
