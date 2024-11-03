import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rating_by: string;

  @ApiProperty({ example: 5, type: Number })
  @IsNotEmpty()
  @IsInt()
  rating_value: number;
}
