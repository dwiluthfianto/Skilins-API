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
// import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Student')
@Controller({ path: 'api/students', version: '1' })
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiCreatedResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOkResponse({
    type: Student,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.studentsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(uuid, updateStudentDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('uuid') uuid: string) {
    return this.studentsService.remove(uuid);
  }
}
