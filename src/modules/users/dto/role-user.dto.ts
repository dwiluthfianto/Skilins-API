import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class RoleUserDto {
  @ApiProperty()
  @IsUUID()
  uuid: string;

  @ApiProperty()
  @IsNumber()
  role: string;
}
