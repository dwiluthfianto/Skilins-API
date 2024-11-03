import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'uuid student', type: String })
  @IsNotEmpty()
  @IsString()
  student_uuid: string;

  @ApiProperty({ example: 'uuid content', type: String })
  @IsNotEmpty()
  @IsString()
  content_uuid: string;

  @ApiProperty({ example: 'uuid competition', type: String })
  @IsNotEmpty()
  @IsString()
  competition_uuid: string;
}
