import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEbookDto } from './create-ebook.dto';
import { IsOptional } from 'class-validator';

export class UpdateEbookDto extends PartialType(CreateEbookDto) {
  @ApiPropertyOptional({ example: 'J.K Rowling', type: String })
  @IsOptional()
  author: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  pages: number;

  @ApiPropertyOptional({ example: 'This is a Publication', type: String })
  @IsOptional()
  publication?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/test.pdf',
    type: String,
  })
  @IsOptional()
  file_url: string;

  @ApiPropertyOptional({ example: 'This is an ISBN', type: String })
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsOptional()
  release_date: Date;
}
