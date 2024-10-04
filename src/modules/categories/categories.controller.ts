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

@ApiTags('Category')
@Controller({ path: 'api/categories', version: '1' })
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiCreatedResponse({ type: Category })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const { success, url, error } = await this.supabaseService.uploadFile(
      avatar_url,
      'skilins_storage/public/images/avatars',
    );

    if (!success) {
      throw new Error(`Failed to upload image: ${error}`);
    }

    createCategoryDto.avatar_url = url;
    return this.categoriesService.create(createCategoryDto);
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
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(uuid, updateCategoryDto);
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.categoriesService.remove(uuid);
  }
}
