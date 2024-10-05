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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Category')
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
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
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
      return await this.categoriesService.create(createCategoryDto);
    } catch (e) {
      console.error('Error during category podcast creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${avatarFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }

      return {
        message:
          'Failed to create category podcast and cleaned up uploaded files.',
      };
    }
  }
  @Get()
  @ApiOkResponse({ type: Category, isArray: true })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.categoriesService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      uuid,
      updateCategoryDto,
    );
    if (category.status === 'success') {
      const isExist = await this.categoriesService.findOne(uuid);
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
    }

    return category;
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.categoriesService.findOne(uuid);
    const thumbFilename = isExist.data.avatar_url
      .split('/')
      .pop()
      .replace(/%20/g, ' ');
    if (isExist) {
      const category = await this.categoriesService.remove(uuid);
      if (category.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.avatar}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete avatar:', error);
        }
      }
      return category;
    }
  }
}
