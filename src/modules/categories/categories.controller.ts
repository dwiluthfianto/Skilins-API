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
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from 'src/supabase/supabase.service';
import { FileUploadingUtils } from 'src/common/utils/file-upload.util';

@ApiTags('Category')
@Controller({ path: 'api/categories', version: '1' })
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseInterceptors(FileUploadingUtils.singleFileUploader('avatar_url'))
  @ApiCreatedResponse({ type: Category })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    let avatarUrl: string | null = null;
    const bucketName = 'skilins_storage';
    const filePath = `public/${avatar.filename}`;

    if (avatar) {
      try {
        const { data, error } =
          await this.supabaseService.supabaseClient.storage
            .from(bucketName)
            .upload(filePath, avatar.buffer, {
              contentType: avatar.mimetype,
            });

        if (error) {
          throw new Error(error.message);
        }

        avatarUrl = this.supabaseService.supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(filePath).publicUrl;

        if (!avatarUrl) {
          throw new Error('Failed to generate public URL');
        }

        createCategoryDto.avatar_url = avatarUrl;
        return this.categoriesService.create(createCategoryDto);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Error uploading file to Supabase');
      }
    }
    throw new BadRequestException('No file uploaded');
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
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(uuid, updateCategoryDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({ type: Category })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.categoriesService.remove(uuid);
  }
}
