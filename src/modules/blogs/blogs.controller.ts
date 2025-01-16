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
  Req,
  ParseFilePipeBuilder,
  Res,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Blog } from './entities/blog.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { SupabaseService } from 'src/supabase';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { Request, Response } from 'express';
import { FindBlogQueryDto } from '../contents/dto/find-blog-query.dto';

@ApiTags('Blogs')
@ApiBearerAuth('JWT-auth')
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
  @ApiConsumes('multipart/form-data')
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
    @Res() res: Response,
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
      const result = await this.blogsService.create(user['sub'], createBlogDto);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during Blog creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbnailFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to create blog and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({
    type: Blog,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FindBlogQueryDto) {
    return this.blogsService.fetchBlogs(query);
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
  @ApiConsumes('multipart/form-data')
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
    @Res() res: Response,
  ) {
    const user = req.user;

    try {
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

      const blog = await this.blogsService.update(
        user['sub'],
        contentUuid,
        updateBlogDto,
      );

      return res.status(HttpStatus.OK).json(blog);
    } catch (error) {
      console.error('Error updating blog:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update blog',
        detail: error.message,
      });
    }
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
