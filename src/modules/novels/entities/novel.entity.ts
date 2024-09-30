import { ApiProperty } from '@nestjs/swagger';
import { Comments, ContentType, Likes, Tags } from '@prisma/client';
import { Content } from 'src/modules/contents/entities/content.entity';

export class Novel implements Content {
  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  uuid: string;

  @ApiProperty({
    example: 'Novel',
    enum: () => ContentType,
  })
  type: ContentType = 'Novel';

  @ApiProperty({
    example: 'This is a title',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    type: String,
  })
  thumbnail: string;

  @ApiProperty({
    example: 'This is a description',
    type: String,
  })
  description: string;

  @ApiProperty({
    example: ['Fiction', 'War'],
    type: String,
  })
  subjects: string[];

  @ApiProperty({
    example: '2024-04-30T04:00:00.000Z',
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-04-30T04:00:00.000Z',
    type: Date,
  })
  updated_at: Date;

  @ApiProperty({
    example: 'Fiction',
    type: String,
  })
  category: string;

  @ApiProperty({ example: 'John Doe', type: String })
  author: string;

  @ApiProperty({ example: 0, type: Number })
  pages: number;

  @ApiProperty({ example: 'https://example.com/test.pdf', type: String })
  file_url: string;

  @ApiProperty({ example: '[]', type: String })
  tags: Tags[];

  @ApiProperty({ example: '[]', type: String })
  comment: Comments[];

  @ApiProperty({ example: '[]', type: String })
  likes: Likes[];
}
