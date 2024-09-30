import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePklReportDto } from './create-pkl-report.dto';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class UpdatePklReportDto extends PartialType(CreatePklReportDto) {
  @ApiPropertyOptional({ example: 'asdsad', type: String })
  @IsUUID()
  author_uuid: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsNumber()
  pages: number;

  @ApiPropertyOptional({
    example: 'https://example.com/test.pdf',
    type: String,
  })
  @IsString()
  file_url: string;

  @ApiPropertyOptional({ example: '2024-09-27T08:49:44.526Z', type: Date })
  @IsDate()
  published_at: Date;
}
