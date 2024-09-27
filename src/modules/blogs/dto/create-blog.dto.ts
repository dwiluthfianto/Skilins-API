import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ContentDto } from 'src/modules/contents/dto/content.dto';

export class CreateBlogDto extends ContentDto {
  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  author_id: string;

  @ApiProperty({ example: 'This is a blog content', type: String })
  @IsNotEmpty()
  blog_content: string;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  content_id: number;

  @ApiProperty({ example: true, type: Boolean })
  @IsNotEmpty()
  published: boolean = false;

  @ApiPropertyOptional({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsOptional()
  published_at?: Date;
}
