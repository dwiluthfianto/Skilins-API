import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreatePklReportDto extends ContentDto {
  @ApiProperty({ example: 'asdsad', type: String })
  @IsNotEmpty()
  @IsUUID()
  author_uuid: string;

  @ApiProperty({ example: 0, type: Number })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsNotEmpty()
  pages: number;

  @ApiProperty({ example: 'https://example.com/test.pdf', type: String })
  @IsNotEmpty()
  @IsString()
  file_url: string;

  @ApiProperty({ example: '2024-09-27T08:49:44.526Z', type: Date })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  published_at: Date;
}
