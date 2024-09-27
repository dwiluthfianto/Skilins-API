import { ApiProperty } from '@nestjs/swagger';
import { Categories } from '@prisma/client';

export class Category implements Categories {
  @ApiProperty({ example: '1', type: Number })
  id: number;

  @ApiProperty({ example: 'Fiction', type: String })
  uuid: string;

  @ApiProperty({ example: 'Fiction', type: String })
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', type: String })
  avatar: string;

  @ApiProperty({ example: 'This is a description', type: String })
  description: string;
}
