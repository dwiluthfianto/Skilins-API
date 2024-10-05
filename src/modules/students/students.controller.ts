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
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Student')
@Controller({ path: 'api/students', version: '1' })
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiCreatedResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image_url'))
  async create(
    @UploadedFile() image_url: Express.Multer.File,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    let imageFilename: string;
    try {
      if (image_url && image_url.size > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            image_url,
            `skilins_storage/${ContentFileEnum.student}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        imageFilename = fileName;
        createStudentDto.image_url = url;
      }
      return await this.studentsService.create(createStudentDto);
    } catch (e) {
      console.error('Error during student creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.student}${imageFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message: 'Failed to create student and cleaned up uploaded files.',
      };
    }
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
  @UseInterceptors(FileInterceptor('image_url'))
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile() image_url: Express.Multer.File,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentsService.update(uuid, updateStudentDto);
    if (student.status === 'success') {
      const isExist = await this.studentsService.findOne(uuid);
      if (image_url && image_url.size > 0) {
        const imageFilename = isExist.data.image_url.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.student}${imageFilename}`,
          image_url,
        );
        if (!success) {
          throw new Error(`Failed to update student: ${error}`);
        }
      }
    }

    return student;
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Student,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.studentsService.findOne(uuid);
    const thumbFilename = isExist.data.image_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const student = await this.studentsService.remove(uuid);
      if (student.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.student}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete student:', error);
        }
      }
      return student;
    }
  }
}
