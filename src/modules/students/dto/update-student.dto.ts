import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional } from 'class-validator';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ example: 'Jane Doe', type: String })
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsOptional()
  major_id: string;

  @ApiPropertyOptional({ example: 'Bogor', type: String })
  @IsOptional()
  birthplace: string;

  @ApiPropertyOptional({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsOptional()
  birthdate: Date;

  @ApiPropertyOptional({ example: 17, type: Number })
  @IsOptional()
  age;

  @ApiPropertyOptional({ example: 'true', type: Boolean })
  @IsOptional()
  status: boolean = true;
}
