import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UpdateGenreDto } from 'src/modules/genres/dto/update-genre.dto';

export class ContentDto {
  @ApiProperty({ example: 'Content Title', type: String })
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', type: String })
  thumbnail: string;

  @ApiPropertyOptional({ example: 'This is a description', type: String })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['Tech', 'Science'],
    type: [String],
  })
  @IsOptional()
  subjects?: string[];

  @ApiProperty({
    example: 'Fiction',
    type: String,
  })
  @IsNotEmpty()
  category_name: string;

  @ApiPropertyOptional({
    example: [
      {
        name: 'this is a genre name',
        avatar_url: 'https://example.com/avatar.jpg',
        description: 'this is a description',
      },
    ],
    type: () => UpdateGenreDto,
  })
  @IsOptional()
  genres: UpdateGenreDto[];
}
