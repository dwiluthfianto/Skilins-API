import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class PklReport {
  @ApiProperty({ example: 'asdsad', type: String })
  @IsUUID()
  author_uuid: string;

  @ApiProperty({ example: 0, type: Number })
  @IsNumber()
  pages: number;

  @ApiProperty({
    example: 'https://example.com/test.pdf',
    type: String,
  })
  @IsString()
  file_url: string;

  @ApiProperty({ example: '2024-09-27T08:49:44.526Z', type: Date })
  @IsDate()
  published_at: Date;
}
