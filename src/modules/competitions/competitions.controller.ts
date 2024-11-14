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
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from 'src/supabase';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Competition } from './entities/competition.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentFileEnum } from '../contents/content-file.enum';

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
  findAll() {
    return this.competitionsService.getAllCompetitions();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.competitionsService.getCompetitionBySlug(slug);
  }

  @Patch(':competitionUuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @ApiCreatedResponse({
    type: Competition,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('competitionUuid') competitionUuid: string,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.updateCompetition(
      competitionUuid,
      updateCompetitionDto,
    );
  }

  @Get(':uuid/winners')
  async getCompetitionWinners(@Param('uuid') uuid: string) {
    return this.competitionsService.getWinnersForCompetition(uuid);
  }
}
