import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class Tag {
  @ApiProperty({
    example: 'uuid',
    type: String,
  })
  @IsUUID()
  uuid?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    type: String,
  })
  @IsString()
  avatar_url?: string;

  @ApiProperty({ example: 'this is a name', type: String })
  @IsString()
  name?: string;

  @ApiProperty({ example: 'this is a desc', type: String })
  @IsString()
  description?: string;
}
