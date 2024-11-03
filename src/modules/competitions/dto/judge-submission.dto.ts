import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class JudgeSubmissionDto {
  @ApiProperty({ example: 'judge uuid', type: String })
  @IsNotEmpty()
  @IsString()
  user_uuid: string;

  @ApiProperty({ example: 'judge uuid', type: String })
  @IsNotEmpty()
  @IsString()
  submission_uuid: string;

  @ApiProperty({ example: 5, type: Number })
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
