import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/common/utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  role: string;
}
