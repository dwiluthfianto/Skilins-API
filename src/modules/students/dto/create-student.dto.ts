import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Jane Doe', type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '36e401d8-a949-404a-bd55-d9115bbc319a',
    type: String,
  })
  @IsNotEmpty()
  major_id: string;

  @ApiProperty({ example: 'Bogor', type: String })
  @IsNotEmpty()
  birthplace: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @IsNotEmpty()
  birthdate: Date;

  @ApiProperty({ example: 17, type: Number })
  @IsNotEmpty()
  age;

  @ApiProperty({ example: 'true', type: Boolean })
  @IsNotEmpty()
  status: boolean = true;
}
