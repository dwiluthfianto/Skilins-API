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
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from 'src/supabase';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Genre } from './entities/genre.entity';
import { ContentFileEnum } from '../contents/content-file.enum';

@ApiTags('Genre')
@Controller({ path: 'api/v1/genres', version: '1' })
export class GenresController {
  constructor(
    private readonly genresService: GenresService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiCreatedResponse({ type: Genre })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() createGenreDto: CreateGenreDto,
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
        createGenreDto.avatar_url = url;
      }
      return await this.genresService.create(createGenreDto);
    } catch (e) {
      console.error('Error during genre creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.avatar}${avatarFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Tag creation failed: ${e.message}. ${avatarFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOkResponse({ type: Genre })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':name')
  @ApiOkResponse({ type: Genre })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('name') name: string) {
    return this.genresService.findOne(name);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @UseInterceptors(FileInterceptor('avatar_url'))
  @ApiOkResponse({ type: Genre })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('uuid') uuid: string,
    @UploadedFile() avatar_url: Express.Multer.File,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const genre = await this.genresService.update(uuid, updateGenreDto);
    if (genre.status === 'success') {
      const isExist = await this.genresService.findOneByUuid(uuid);
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

    return genre;
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({ type: Genre })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string) {
    const isExist = await this.genresService.findOneByUuid(uuid);
    const thumbFilename = isExist?.data?.avatar_url
      ? isExist.data.avatar_url.split('/').pop().replace(/%20/g, ' ')
      : null;
    if (isExist) {
      const genre = await this.genresService.remove(uuid);
      if (genre.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.avatar}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete avatar:', error);
        }
      }
      return genre;
    }
  }
}