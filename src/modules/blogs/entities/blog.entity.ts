import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Comments, Likes, Tags } from '@prisma/client';
import { Contents } from 'src/modules/contents/content.interface';

export class Blog implements Contents {
  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  id: string | number;

  @ApiProperty({
    example: 'Ebook',
    type: $Enums.ContentType,
  })
  type: $Enums.ContentType;

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
    example: 1,
    type: String,
  })
  category_uuid: string;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  author_uuid: string;

  @ApiProperty({ example: 'This is a blog content', type: String })
  blog_content: string;

  @ApiProperty({ example: true, type: Boolean })
  published: boolean = false;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  published_at: Date;

  @ApiProperty({ example: '[]', type: String })
  tags: Tags[];

  @ApiProperty({ example: '[]', type: String })
  comments: Comments[];

  @ApiProperty({ example: '[]', type: String })
  likes: Likes[];
}
