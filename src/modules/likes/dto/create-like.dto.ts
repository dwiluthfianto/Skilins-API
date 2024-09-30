import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  liked_by: string;
}
