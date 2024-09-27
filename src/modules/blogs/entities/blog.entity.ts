import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Contents } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class Blog implements Contents {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  uuid: string;

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
    type: Number,
  })
  category_id: number;

  @ApiProperty({ example: 1, type: Number })
  author_id: number;

  @ApiProperty({ example: 'This is a blog content', type: String })
  blog_content: string;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  content_id: number;

  @ApiProperty({ example: true, type: Boolean })
  published: boolean = false;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  published_at: Date;
}
