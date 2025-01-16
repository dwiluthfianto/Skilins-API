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
  UploadedFiles,
  UseInterceptors,
  Query,
  Res,
} from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Ebook } from './entities/ebook.entity';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';
import { FindContentQueryDto } from '../contents/dto/find-content-query.dto';
import { Response } from 'express';

@ApiTags('Ebooks')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'api/v1/contents/ebooks', version: '1' })
export class EbooksController {
  constructor(
    private readonly ebooksService: EbooksService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiCreatedResponse({
    type: Ebook,
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  async create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Body() createEbookDto: CreateEbookDto,
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

        createEbookDto.thumbnail = thumbnailUrl;
      }

      if (files.file_url && files.file_url.length > 0) {
        const {
          success: fileSuccess,
          url: fileUrl,
          fileName: fileUrlFilename,
          error: fileError,
        } = await this.supabaseService.uploadFile(
          files.file_url[0],
          `skilins_storage/${ContentFileEnum.file_ebook}`,
        );

        if (!fileSuccess) {
          throw new Error(`Failed to upload file: ${fileError}`);
        }
        fileFilename = fileUrlFilename;
        createEbookDto.file_url = fileUrl;
      }
      const result = await this.ebooksService.create(createEbookDto);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during ebook podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.file_ebook}${fileFilename}`,
        `${ContentFileEnum.thumbnail}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to create ebook and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: Ebook,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindContentQueryDto) {
    return this.ebooksService.fetchEbooks(query);
  }

  @Get(':slug')
  @ApiOkResponse({
    type: Ebook,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.ebooksService.findOneBySlug(slug);
  }

  @Patch(':contentUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({
    type: Ebook,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'file_url' }]),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      file_url?: Express.Multer.File[];
    },
    @Param('contentUuid') contentUuid: string,
    @Body() updateEbookDto: UpdateEbookDto,
    @Res() res: Response,
  ) {
    try {
      const currentEbook = await this.ebooksService.findOne(contentUuid);

      if (!currentEbook) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'Ebook not found',
        });
      }

      if (files?.thumbnail && files.thumbnail.length > 0) {
        const currentThumbFilename = currentEbook.data.thumbnail
          ?.split('/')
          .pop();
        const { success: thumbUpdateSuccess, error: thumbUpdateError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.thumbnail}${currentThumbFilename}`,
            files.thumbnail[0],
          );

        if (!thumbUpdateSuccess) {
          throw new Error(`Failed to update thumbnail: ${thumbUpdateError}`);
        }
      }

      if (files?.file_url && files.file_url.length > 0) {
        const currentFileFilename = currentEbook.data.file_url
          ?.split('/')
          .pop();
        const { success: fileUpdateSuccess, error: fileUpdateError } =
          await this.supabaseService.updateFile(
            `${ContentFileEnum.file_ebook}${currentFileFilename}`,
            files.file_url[0],
          );

        if (!fileUpdateSuccess) {
          throw new Error(`Failed to update file: ${fileUpdateError}`);
        }
      }

      const updatedEbook = await this.ebooksService.update(
        contentUuid,
        updateEbookDto,
      );

      return res.status(HttpStatus.OK).json(updatedEbook);
    } catch (error) {
      console.error('Error updating ebook:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update ebook',
        detail: error.message,
      });
    }
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({
    type: Ebook,
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.ebooksService.findOne(uuid);
    const thumbFilename = isExist.data.thumbnail
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    const fileFilename = isExist.data.file_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const ebook = await this.ebooksService.remove(uuid);
      if (ebook.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          `${ContentFileEnum.file_ebook}${fileFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete file:', error);
        }
      }
      return ebook;
    }
  }
}
