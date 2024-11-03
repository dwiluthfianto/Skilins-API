import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreateStoryDto extends ContentDto {
  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  author_uuid: string;
}
