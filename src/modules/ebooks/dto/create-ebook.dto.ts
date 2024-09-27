import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreateEbookDto extends ContentDto {
  @ApiProperty({ example: 'J.K Rowling', type: String })
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  pages: number;

  @ApiPropertyOptional({ example: 'This is a Publication', type: String })
  @IsOptional()
  publication?: string;

  @ApiProperty({ example: 'https://example.com/test.pdf', type: String })
  @IsNotEmpty()
  file_url: string;

  @ApiPropertyOptional({ example: 'This is an ISBN', type: String })
  @IsOptional()
  isbn?: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsNotEmpty()
  release_date: Date;
}
