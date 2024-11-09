import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePrakerinDto } from './create-prakerin.dto';
import { IsDate, IsInt, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePrakerinDto extends PartialType(CreatePrakerinDto) {
  @ApiPropertyOptional({ example: 'asdsad', type: String })
  @IsUUID()
  author_uuid: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  pages: number;

  @ApiPropertyOptional({
    example: 'https://example.com/test.pdf',
    type: String,
  })
  @IsString()
  file_url: string;

  @ApiPropertyOptional({ example: '2024-09-27T08:49:44.526Z', type: Date })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  published_at: Date;
}
