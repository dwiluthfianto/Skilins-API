import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class CreateNovelDto {
  @ApiProperty()
  type:
    | 'Ebook'
    | 'VideoPodcast'
    | 'AudioPodcast'
    | 'Novel'
    | 'PklReport'
    | 'Blog'; // Ebook, Video Podcast, Audio Podcast, etc.

  @ApiProperty()
  title: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  subjects: string[];

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  author_id: number;

  @ApiProperty()
  pages: number;

  @ApiProperty()
  file: string;

  @ApiProperty()
  content_id: number;
}
export class CreateAudioPodcastDto {
  @ApiProperty()
  type:
    | 'Ebook'
    | 'VideoPodcast'
    | 'AudioPodcast'
    | 'Novel'
    | 'PklReport'
    | 'Blog'; // Ebook, Video Podcast, Audio Podcast, etc.

  @ApiProperty()
  title: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  subjects: string[];

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  creator_id: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  link: string;

  @ApiProperty()
  content_id: number;
}
export class CreateVideoPodcastDto {
  @ApiProperty()
  type:
    | 'Ebook'
    | 'VideoPodcast'
    | 'AudioPodcast'
    | 'Novel'
    | 'PklReport'
    | 'Blog'; // Ebook, Video Podcast, Audio Podcast, etc.

  @ApiProperty()
  title: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  subjects: string[];

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  creator_id: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  link: string;

  @ApiProperty()
  content_id: number;
}
