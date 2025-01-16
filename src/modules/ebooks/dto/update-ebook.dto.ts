import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEbookDto } from './create-ebook.dto';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEbookDto extends PartialType(CreateEbookDto) {
  @ApiPropertyOptional({ example: 'J.K Rowling', type: String })
  @IsOptional()
  author: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  pages?: number;

  @ApiPropertyOptional({ example: 'This is a Publication', type: String })
  @IsOptional()
  publication?: string;

  @ApiPropertyOptional({ example: 'This is an ISBN', type: String })
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: '2024-04-30', type: Date })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  release_date: Date;
}
