import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/modules/roles/roles.decorator';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Competition } from '../entities/competition.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from 'src/modules/contents/content-file.enum';

@ApiTags('Submission')
@Controller({ path: 'api/v1/competitions', version: '1' })
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Patch(':submissionUuid/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @HttpCode(HttpStatus.OK)
  approveSubmission(@Param('submissionUuid') submissionUuid: string) {
    return this.submissionService.approveSubmission(submissionUuid);
  }

  @Patch(':submissionUuid/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @HttpCode(HttpStatus.OK)
  rejectSubmission(@Param('submissionUuid') submissionUuid: string) {
    return this.submissionService.rejectSubmission(submissionUuid);
  }

  @Post('submit')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @ApiCreatedResponse({
    type: Competition,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.CREATED)
  async submitToCompetition(
    @Req() req: Request,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    const user = req.user;
    let thumbFilename: string;
    let fileFilename: string;

    try {
      // Upload thumbnail if present
      if (files.thumbnail && files.thumbnail.length > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            files.thumbnail[0],
            `skilins_storage/thumbnails`,
          );

        if (!success) {
          throw new Error(`Failed to upload thumbnail: ${error}`);
        }

        thumbFilename = fileName;
        switch (createSubmissionDto.type) {
          case 'AUDIO':
            createSubmissionDto.audioData.thumbnail = url;
            break;
          case 'VIDEO':
            createSubmissionDto.videoData.thumbnail = url;
            break;
          case 'PRAKERIN':
            createSubmissionDto.prakerinData.thumbnail = url;
            break;
        }
      }

      switch (createSubmissionDto.type) {
        case 'AUDIO':
          if (files.file_url && files.file_url.length > 0) {
            const { success, url, fileName, error } =
              await this.supabaseService.uploadFile(
                files.file_url[0],
                `skilins_storage/${ContentFileEnum.file_audio}`,
              );

            if (!success) {
              throw new Error(`Failed to upload audio file: ${error}`);
            }

            fileFilename = fileName;
            createSubmissionDto.audioData.file_url = url;
          }
          break;

        case 'VIDEO':
          if (files.file_url && files.file_url.length > 0) {
            const { success, url, fileName, error } =
              await this.supabaseService.uploadFile(
                files.file_url[0],
                `skilins_storage/${ContentFileEnum.file_video}`,
              );

            if (!success) {
              throw new Error(`Failed to upload video file: ${error}`);
            }

            fileFilename = fileName;
            createSubmissionDto.videoData.file_url = url;
          }
          break;

        case 'PRAKERIN':
          if (files.file_url && files.file_url.length > 0) {
            const { success, url, fileName, error } =
              await this.supabaseService.uploadFile(
                files.file_url[0],
                `skilins_storage/${ContentFileEnum.file_report}`,
              );

            if (!success) {
              throw new Error(`Failed to upload ebook file: ${error}`);
            }

            fileFilename = fileName;
            createSubmissionDto.prakerinData.file_url = url;
          }
          break;

        default:
          throw new Error('Unsupported submission type');
      }

      // Proceed to submit to competition
      const submit = await this.submissionService.submitToCompetition(
        user['sub'],
        createSubmissionDto,
      );

      return submit;
    } catch (error) {
      console.error('Error during competition submission:', error.message);

      switch (createSubmissionDto.type) {
        case 'AUDIO': {
          const { success, error } = await this.supabaseService.deleteFile([
            `${ContentFileEnum.file_audio}${fileFilename}`,
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
          ]);
          if (!success) {
            console.error('Failed to delete files:', error);
          }
          break;
        }
        case 'VIDEO': {
          const { success, error } = await this.supabaseService.deleteFile([
            `${ContentFileEnum.file_video}${fileFilename}`,
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
          ]);
          if (!success) {
            console.error('Failed to delete files:', error);
          }
          break;
        }
        case 'PRAKERIN': {
          const { success, error } = await this.supabaseService.deleteFile([
            `${ContentFileEnum.file_report}${fileFilename}`,
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
          ]);
          if (!success) {
            console.error('Failed to delete files:', error);
          }
          break;
        }
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Competition creation failed: ${error.message}.`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
