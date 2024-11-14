import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class EvaluateSubmissionDto {
  @ApiProperty({ example: 'submission uuid', type: String })
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
