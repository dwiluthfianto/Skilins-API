import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateCompetitionDto {
  @ApiProperty({ example: 'Title of competition', type: String })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Story', enum: ContentType })
  @IsNotEmpty()
  type: ContentType;

  @ApiProperty({ example: 'Description of competition', type: String })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @ApiProperty({ example: '2024-04-30T04:00:00.000Z', type: Date })
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  @IsDate()
  submission_deadline: Date;
}
