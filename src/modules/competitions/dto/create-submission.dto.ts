import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { CreateAudioPodcastDto } from 'src/modules/audio-podcasts/dto/create-audio-podcast.dto';
import { CreatePrakerinDto } from 'src/modules/prakerin/dto/create-prakerin.dto';
import { CreateVideoPodcastDto } from 'src/modules/video-podcasts/dto/create-video-podcast.dto';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'slug competition', type: String })
  @IsNotEmpty()
  @IsString()
  competition_slug: string;

  @ApiProperty({ example: 'AudioPodcast', enum: ContentType })
  @IsNotEmpty()
  @IsEnum(ContentType)
  type: ContentType;

  @ValidateIf((o) => o.type === ContentType.AUDIO)
  @Type(() => CreateAudioPodcastDto)
  audioData?: CreateAudioPodcastDto;

  @ValidateIf((o) => o.type === ContentType.VIDEO)
  @Type(() => CreateVideoPodcastDto)
  videoData?: CreateVideoPodcastDto;

  @ValidateIf((o) => o.type === ContentType.PRAKERIN)
  @Type(() => CreatePrakerinDto)
  prakerinData?: CreatePrakerinDto;
}
