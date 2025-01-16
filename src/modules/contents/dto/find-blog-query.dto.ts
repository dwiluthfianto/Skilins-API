import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindBlogQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  page: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Popular Choice',
    description: 'Search by tag of content',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Title of content',
    description: 'Search by title of content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Search by the latest of content',
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  latest?: boolean;

  @ApiPropertyOptional({
    type: ContentStatus,
    enum: ContentStatus,
    description: 'Search by status approval of content',
  })
  @IsOptional()
  @IsString()
  status?: ContentStatus;
}
