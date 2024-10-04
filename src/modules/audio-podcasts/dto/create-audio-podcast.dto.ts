import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreateAudioPodcastDto extends ContentDto {
  @ApiProperty({
    example: 2.3,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
    example: 'https://example.com/video.mp4',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  file_url: string;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  creator_uuid: string;
}
