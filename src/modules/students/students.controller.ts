import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Student } from './entities/student.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { StatusStudentDto } from './dto/update-status-student.dto';

@ApiTags('Student')
@Controller({ path: 'api/v1/students', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.CREATED)
  @Roles('User')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return await this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOkResponse({
    type: Student,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff')
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff', 'Student')
  findOne(@Param('uuid') uuid: string) {
    return this.studentsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff', 'Student')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentsService.update(uuid, updateStudentDto);
  }

  @Patch(':uuid/verify-student')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff')
  async verifyStudent(
    @Param('uuid') uuid: string,
    @Body() statusStudentDto: StatusStudentDto,
  ) {
    return await this.studentsService.verifiedStudent(uuid, statusStudentDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff')
  async remove(@Param('uuid') uuid: string) {
    return await this.studentsService.remove(uuid);
  }
}
