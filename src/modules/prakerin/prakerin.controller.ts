import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PrakerinService } from './prakerin.service';
import { CreatePrakerinDto } from './dto/create-prakerin.dto';
import { UpdatePrakerinDto } from './dto/update-prakerin.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prakerin } from './entities/prakerin.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { SupabaseService } from 'src/supabase';
import { Request, Response } from 'express';
import { FindPrakerinQueryDto } from '../contents/dto/find-prakerin-query.dto';

@ApiTags('Prakerin')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'api/v1/contents/prakerin', version: '1' })
export class PrakerinController {
  constructor(
    private readonly prakerinService: PrakerinService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @ApiCreatedResponse({
    type: Prakerin,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createPrakerinDto: CreatePrakerinDto,
    @Res() res: Response,
  ) {
    let thumbFilename: string;
    let fileFilename: string;
    try {
      if (files.thumbnail && files.thumbnail.length > 0) {
        const {
          success: thumbnailSuccess,
          url: thumbnailUrl,
          fileName: thumbnailFilename,
          error: thumbnailError,
        } = await this.supabaseService.uploadFile(
          files.thumbnail[0],
          `skilins_storage/${ContentFileEnum.thumbnail}`,
        );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to upload thumbnail: ${thumbnailError}`);
        }

        thumbFilename = thumbnailFilename;

        createPrakerinDto.thumbnail = thumbnailUrl;
      }

      if (files.file_url && files.file_url.length > 0) {
        const {
          success: fileSuccess,
          url: fileUrl,
          fileName: fileUrlFilename,
          error: fileError,
        } = await this.supabaseService.uploadFile(
          files.file_url[0],
          `skilins_storage/${ContentFileEnum.file_report}`,
        );

        if (!fileSuccess) {
          throw new Error(`Failed to upload file: ${fileError}`);
        }
        fileFilename = fileUrlFilename;
        createPrakerinDto.file_url = fileUrl;
      }

      const result = await this.prakerinService.create(createPrakerinDto);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during report podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_report}${fileFilename}`,
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to create prakerin and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: Prakerin,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindPrakerinQueryDto) {
    return this.prakerinService.fetchPrakerin(query);
  }

  @Get('student')
  @ApiOkResponse({
    type: Prakerin,
    isArray: true,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @HttpCode(HttpStatus.OK)
  async findUserPrakerin(
    @Req() req: Request,
    @Query() query: FindPrakerinQueryDto,
  ) {
    const user = req.user;
    return await this.prakerinService.fetchUserPrakerin(user['sub'], query);
  }

  @Get(':slug')
  @ApiOkResponse({
    type: Prakerin,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.prakerinService.findOneBySlug(slug);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Student')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiOkResponse({
    type: Prakerin,
  })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('uuid') uuid: string,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() updatePrakerinDto: UpdatePrakerinDto,
    @Res() res: Response,
  ) {
    try {
      const isExist = await this.prakerinService.findOne(uuid);

      if (!isExist) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'Prakerin not found',
        });
      }

      if (files.thumbnail && files.thumbnail.length > 0) {
        const thumbFilename = isExist.data.thumbnail.split('/').pop();

        const { success: thumbnailSuccess, error: thumbnailError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.thumbnail}${thumbFilename}`,
            files.thumbnail[0],
          );

        if (!thumbnailSuccess) {
          throw new Error(`Failed to update thumbnail: ${thumbnailError}`);
        }
      }

      if (files.file_url && files.file_url.length > 0) {
        const fileFilename = isExist.data.file_url.split('/').pop();
        const { success: fileSuccess, error: fileError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.file_report}${fileFilename}`,
            files.file_url[0],
          );

        if (!fileSuccess) {
          throw new Error(`Failed to update file: ${fileError}`);
        }
      }

      const updatedPrakerin = await this.prakerinService.update(
        uuid,
        updatePrakerinDto,
      );

      return res.status(HttpStatus.OK).json(updatedPrakerin);
    } catch (error) {
      console.error('Error updating prakerin:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update prakerin',
        detail: error.message,
      });
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: Prakerin,
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.prakerinService.findOne(uuid);
    const thumbFilename = isExist.data.thumbnail
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const fileFilename = isExist.data.file_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const report = await this.prakerinService.remove(uuid);
      if (report.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          `${ContentFileEnum.file_report}${fileFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete file:', error);
        }
      }
      return report;
    }
  }
}
