import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { CreateAudioPodcastDto } from 'src/modules/audio-podcasts/dto/create-audio-podcast.dto';
import { CreatePrakerinDto } from 'src/modules/prakerin/dto/create-prakerin.dto';
import { CreateVideoPodcastDto } from 'src/modules/video-podcasts/dto/create-video-podcast.dto';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'uuid competition', type: String })
  @IsNotEmpty()
  @IsString()
  competition_uuid: string;

  @ApiProperty({ example: 'AudioPodcast', enum: ContentType })
  @IsNotEmpty()
  @IsEnum(ContentType)
  type: ContentType;

  @ValidateIf((o) => o.type === ContentType.AudioPodcast)
  audioData?: CreateAudioPodcastDto;

  @ValidateIf((o) => o.type === ContentType.VideoPodcast)
  videoData?: CreateVideoPodcastDto;

  @ValidateIf((o) => o.type === ContentType.Prakerin)
  prakerinData?: CreatePrakerinDto;
}
