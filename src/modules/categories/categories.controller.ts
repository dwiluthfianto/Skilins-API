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
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';
import { Response } from 'express';

@ApiTags('Category')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'api/v1/categories', version: '1' })
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiCreatedResponse({ type: Category })
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    let avatarFilename: string;
    try {
      if (avatar_url && avatar_url.size > 0) {
        const { success, url, fileName, error } =
          await this.supabaseService.uploadFile(
            avatar_url,
            `skilins_storage/${ContentFileEnum.avatar}`,
          );

        if (!success) {
          throw new Error(`Failed to upload image: ${error}`);
        }

        avatarFilename = fileName;
        createCategoryDto.avatar_url = url;
      }
      const result = await this.categoriesService.create(createCategoryDto);

      return res.status(HttpStatus.CREATED).json(result);
    } catch (e) {
      console.error('Error during category creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${avatarFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to create category and cleaned up uploaded files.',
        detail: e.message,
      });
    }
  }
  @Get()
  @ApiOkResponse({ type: Category, isArray: true })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'search by name for categories',
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query('search') search: string) {
    return this.categoriesService.findAll(search);
  }

  @Get(':name')
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('name') name: string) {
    return this.categoriesService.findOne(name);
  }

  @Patch(':name')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiOkResponse({ type: Category })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('name') name: string,
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Res() res: Response,
  ) {
    try {
      const isExist = await this.categoriesService.findOne(name);

      if (!isExist) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'Category not found',
        });
      }

      if (avatar_url && avatar_url.size > 0) {
        const avatarFilename = isExist.data.avatar_url.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.avatar}${avatarFilename}`,
          avatar_url,
        );
        if (!success) {
          throw new Error(`Failed to update avatar: ${error}`);
        }
      }

      const updatedCategory = await this.categoriesService.update(
        name,
        updateCategoryDto,
      );

      return res.status(HttpStatus.OK).json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to update category',
        detail: error.message,
      });
    }
  }

  @Delete(':name')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ type: Category })
  async remove(@Param('name') name: string, @Res() res: Response) {
    try {
      const isExist = await this.categoriesService.findOne(name);

      if (!isExist) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'Category not found',
        });
      }

      const thumbFilename = isExist.data.avatar_url
        .split('/')
        .pop()
        .replace(/%20/g, ' ');

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${thumbFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete avatar:', error);
      }

      const category = await this.categoriesService.remove(name);

      return res.status(HttpStatus.OK).json(category);
    } catch (error) {
      console.error('Error deleting category:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'Failed to delete category',
        detail: error.message,
      });
    }
  }
}
