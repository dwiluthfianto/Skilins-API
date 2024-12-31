import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  HttpException,
  HttpCode,
  Query,
  Delete,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseService } from 'src/supabase';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Competition } from './entities/competition.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';
import { FindCompetitionQueryDto } from './dto/find-competition-query.dto';

@ApiTags('Competition')
@Controller({ path: 'api/v1/competitions', version: '1' })
export class CompetitionsController {
  constructor(
    private readonly competitionsService: CompetitionsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiCreatedResponse({
    type: Competition,
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
    @Body() createCompetitionDto: CreateCompetitionDto,
  ) {
    let thumbnailFilename: string;
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
        createCompetitionDto.thumbnail = url;
      }
      return await this.competitionsService.createCompetition(
        createCompetitionDto,
      );
    } catch (e) {
      console.error('Error during Competition creation:', e.message);

      const { success, error } = await this.supabaseService.deleteFile([
        `${ContentFileEnum.thumbnail}${thumbnailFilename}`,
      ]);

      if (!success) {
        console.error('Failed to delete files:', error);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Competition creation failed: ${e.message}. ${thumbnailFilename ? 'Failed to clean up uploaded file' : ''}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll(@Query() query: FindCompetitionQueryDto) {
    const { page, limit, search, type } = query;
    if (type) {
      return this.competitionsService.getCompetitionByType(page, limit, type);
    }
    return this.competitionsService.getAllCompetitions(page, limit, search);
  }

  @Get('active')
  findActiveCompetition(@Query() query: FindCompetitionQueryDto) {
    const { page, limit, search } = query;
    return this.competitionsService.getActiveCompetitions(page, limit, search);
  }

  @Get('finished')
  findFinishedCompetition(@Query() query: FindCompetitionQueryDto) {
    const { page, limit, search } = query;
    return this.competitionsService.getFinishedCompetitions(
      page,
      limit,
      search,
    );
  }

  @Get('/detail/:slug')
  findOne(
    @Param('slug') slug: string,
    @Query('status') status: string,
    @Query('type') type: string,
  ) {
    return this.competitionsService.getCompetitionDetail(slug, type, status);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.competitionsService.getCompetitionBySlug(slug);
  }

  @Patch(':competitionUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiCreatedResponse({
    type: Competition,
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
    @Param('competitionUuid') competitionUuid: string,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
  ) {
    const competition = await this.competitionsService.updateCompetition(
      competitionUuid,
      updateCompetitionDto,
    );

    if (competition.status === 'success') {
      const isExist =
        await this.competitionsService.getCompetitionByUuid(competitionUuid);
      if (thumbnail && thumbnail.size > 0) {
        const thumbFilename = isExist.data.thumbnail.split('/').pop();
        const { success, error } = await this.supabaseService.updateFile(
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
          thumbnail,
        );
        if (!success) {
          throw new Error(`Failed to update thumbnail: ${error}`);
        }
      }
    }

    return competition;
  }

  @Delete(':competitionUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiOkResponse({ type: Competition })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('competitionUuid') competitionUuid: string) {
    const isExist =
      await this.competitionsService.getCompetitionByUuid(competitionUuid);
    const thumbFilename = isExist?.data?.thumbnail
      ? isExist.data.thumbnail.split('/').pop().replace(/%20/g, ' ')
      : null;
    if (isExist) {
      const tag =
        await this.competitionsService.removeCompetition(competitionUuid);
      if (tag.status === 'success') {
        const { success, error } = await this.supabaseService.deleteFile([
          `${ContentFileEnum.thumbnail}${thumbFilename}`,
        ]);

        if (!success) {
          console.error('Failed to delete thumbnail:', error);
        }
      }
      return tag;
    }
  }

  @Get(':uuid/winners')
  async getCompetitionWinners(@Param('uuid') uuid: string) {
    return this.competitionsService.getWinnersForCompetition(uuid);
  }
}
