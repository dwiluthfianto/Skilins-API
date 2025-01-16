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
  Query,
  Res,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  ApiBasicAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Student } from './entities/student.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { FindStudentDto } from './dto/find-student.dto';
import { Response } from 'express';

@ApiTags('Student')
@ApiBasicAuth('JWT-auth')
@Controller({ path: 'api/v1/students', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Student,
  })
  @Roles('User')
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.studentsService.create(createStudentDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to create student.',
        detail: error.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: Student,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff')
  findAll(@Query() query: FindStudentDto) {
    return this.studentsService.findAll(query);
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
    @Res() res: Response,
  ) {
    try {
      const result = await this.studentsService.update(uuid, updateStudentDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update student.',
        detail: error.message,
      });
    }
  }

  @Patch(':uuid/verify-student')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @Roles('Staff')
  async verifyStudent(@Param('uuid') uuid: string) {
    return await this.studentsService.verifiedStudent(uuid);
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
