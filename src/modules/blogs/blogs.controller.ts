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
  UseInterceptors,
  UploadedFile,
  HttpException,
  Req,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Blog } from './entities/blog.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { SupabaseService } from 'src/supabase';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { Request } from 'express';

@ApiTags('Contents')
@Controller({ path: 'api/v1/contents/blogs', version: '1' })
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiCreatedResponse({
    type: Blog,
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 500 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    thumbnail: Express.Multer.File,
    @Req() req: Request,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    let thumbnailFilename: string;
    const user = req.user;
    try {
      if (thumbnail && thumbnail.size > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            thumbnail,
            `skilins_storage/${ContentFileEnum.thumbnail}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        thumbnailFilename = fileName;
        createBlogDto.thumbnail = url;
      }
      return await this.blogsService.create(user['sub'], createBlogDto);
    } catch (e) {
      console.error('Error during Blog creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbnailFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Blog creation failed: ${e.message}. ${thumbnailFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOkResponse({
    type: Blog,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('category') category: string,
    @Query('genre') genre: string,
  ) {
    if (category) {
      return this.blogsService.findByCategory(page, limit, category);
    } else if (genre) {
      return this.blogsService.findByGenre(page, limit, genre);
    } else {
      return this.blogsService.findAll(page, limit);
    }
  }

  @Get('latest')
  @ApiOkResponse({
    type: Blog,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findLatest(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
    @Query('week') week: number = 1,
  ) {
    return this.blogsService.findLatest(page, limit, week);
  }

  @Get(':slug')
  @ApiOkResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findOneBySlug(slug);
  }

  @Patch(':contentUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({
    type: Blog,
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  @HttpCode(HttpStatus.OK)
  async update(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 500 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    thumbnail: Express.Multer.File,
    @Req() req: Request,
    @Param('contentUuid') contentUuid: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const user = req.user;
    const blog = await this.blogsService.update(
      user['sub'],
      contentUuid,
      updateBlogDto,
    );
    if (blog.status === 'success') {
      const isExist = await this.blogsService.findOneByUuid(contentUuid);
      if (thumbnail && thumbnail.size > 0) {
        const avatarFilename = isExist.data.thumbnail.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.thumbnail}${avatarFilename}`,
          thumbnail,
        );
        if (!success) {
          throw new Error(`Failed to update thumbnail: ${error}`);
        }
      }
    }

    return blog;
  }

  @Delete(':contentUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('contentUuid') contentUuid: string) {
    const isExist = await this.blogsService.findOneByUuid(contentUuid);
    const thumbFilename = isExist?.data?.thumbnail
      ? isExist.data.thumbnail.split('/').pop().replace(/%20/g, ' ')
      : null;
    if (isExist) {
      const blog = await this.blogsService.remove(contentUuid);
      if (blog.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete thumbnail:', error);
        }
      }
      return blog;
    }
  }
}
