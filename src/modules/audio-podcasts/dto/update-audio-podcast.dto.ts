import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAudioPodcastDto } from './create-audio-podcast.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAudioPodcastDto extends PartialType(CreateAudioPodcastDto) {
  @ApiPropertyOptional({
    example: 2.3,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/video.mp4',
    type: String,
  })
  @IsOptional()
  @IsString()
  file_url?: string;
}
