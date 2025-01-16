import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreatePrakerinDto extends ContentDto {
  @ApiProperty({ example: 'asdsad', type: String })
  @IsNotEmpty()
  author_uuid: string;

  @ApiProperty({ example: 0, type: Number })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsNotEmpty()
  pages: number;

  @ApiProperty({ type: String, format: 'binary' })
  file_url: string;
}
