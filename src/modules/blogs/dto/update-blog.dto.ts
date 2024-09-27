import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @ApiPropertyOptional({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  author_uuid: string;

  @ApiPropertyOptional({ example: 'This is a blog content', type: String })
  blog_content: string;

  @ApiPropertyOptional({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  content_uuid: string;

  @ApiPropertyOptional({ example: true, type: Boolean })
  published: boolean = false;

  @ApiPropertyOptional({ example: '2024-04-30T04:00:00.000Z', type: Date })
  published_at?: Date;
}
