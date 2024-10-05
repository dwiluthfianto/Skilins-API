import { ApiProperty } from '@nestjs/swagger';
import { SexType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

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
    example: 'RPL',
    type: String,
  })
  @IsNotEmpty()
  major: string;

  @ApiProperty({ example: 'Bogor', type: String })
  @IsNotEmpty()
  birthplace: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsNotEmpty()
  birthdate: Date;

  @ApiProperty({ example: 'male', enum: SexType })
  @IsNotEmpty()
  sex: SexType;

  @ApiProperty({ example: 'true', type: Boolean })
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  @IsNotEmpty()
  status: boolean = true;
}
