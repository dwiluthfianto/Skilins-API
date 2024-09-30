import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'https://example.com/siswa.jpg', type: String })
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: '123456', type: String })
  @IsNotEmpty()
  nis: string;

  @ApiProperty({ example: 'Jane Doe', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  major_uuid: string;

  @ApiProperty({ example: 'Bogor', type: String })
  @IsNotEmpty()
  birthplace: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsNotEmpty()
  birthdate: Date;

  @ApiProperty({ example: 17, type: Number })
  @IsNotEmpty()
  age: number;

  @ApiProperty({ example: 'true', type: Boolean })
  @IsNotEmpty()
  status: boolean = true;
}
