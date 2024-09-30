import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreateNovelDto extends ContentDto {
  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  author_uuid: string;

  @ApiProperty({ example: 0, type: Number })
  @IsNotEmpty()
  pages: number;

  @ApiProperty({ example: 'https://example.com/document.pdf', type: String })
  @IsNotEmpty()
  file_url: string;
}
