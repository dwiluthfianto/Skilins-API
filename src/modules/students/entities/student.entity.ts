import { ApiProperty } from '@nestjs/swagger';

export class Student {
  @ApiProperty({
    example: 'https://example.com/siswa.jpg',
    type: String,
  })
  image_url: string;

  @ApiProperty({ example: '123456', type: String })
  nis: string;

  @ApiProperty({ example: 'Jane Doe', type: String })
  name: string;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  major_uuid: string;

  @ApiProperty({ example: 'Bogor', type: String })
  birthplace: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  birthdate: Date;

  @ApiProperty({ example: 17, type: Number })
  age;

  @ApiProperty({ example: 'true', type: Boolean })
  status: boolean = true;
}
