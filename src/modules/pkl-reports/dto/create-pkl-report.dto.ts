import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreatePklReportDto extends ContentDto {
  @ApiProperty({ example: 'asdsad', type: String })
  @IsNotEmpty()
  @IsUUID()
  author_uuid: string;

  @ApiProperty({ example: 0, type: Number })
  @IsNotEmpty()
  @IsNumber()
  pages: number;

  @ApiProperty({ example: 'https://example.com/test.pdf', type: String })
  @IsNotEmpty()
  @IsString()
  file_url: string;

  @ApiProperty({ example: '2024-09-27T08:49:44.526Z', type: Date })
  @IsNotEmpty()
  @IsDate()
  published_at: Date;
}
