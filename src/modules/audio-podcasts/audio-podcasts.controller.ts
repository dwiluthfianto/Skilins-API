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
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AudioPodcast } from './entities/audio-podcast.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';

@ApiTags('Contents')
@Controller({ path: 'api/contents/audios', version: '1' })
export class AudioPodcastsController {
  constructor(private readonly audioPodcastsService: AudioPodcastsService) {}

  // @Post()
  // @ApiCreatedResponse({
  //   type: AudioPodcast,
  // })
  // @HttpCode(HttpStatus.CREATED)
  // async create(
  //   @UploadedFile('thumbnail') thumbnail: Express.Multer.File,
  //   @UploadedFile('file_url') fileUrl: Express.Multer.File,
  //   @Body() createAudioPodcastDto: CreateAudioPodcastDto,
  // ) {
  //   // Handle potential upload errors (e.g., size limit exceeded, invalid format)
  //   if (thumbnail && thumbnail instanceof MulterError) {
  //     throw new Error(thumbnail.message);
  //   }

  //   // Handle file_url upload errors (if using local storage)

  //   let thumbnailUrl;
  //   let fileUrlPath; // Optional (if using local storage)

  //   try {
  //     if (thumbnail) {
  //       const { data: thumbnailData, error: thumbnailError } =
  //         await this.supabaseService.supabaseClient.storage
  //           .from('thumbnails')
  //           .upload(thumbnail.originalname, thumbnail.buffer, {
  //             contentType: thumbnail.mimetype,
  //           });

  //       if (thumbnailError) {
  //         throw new Error(thumbnailError.message);
  //       }

  //       thumbnailUrl = thumbnailData.fullPath;
  //     }

  //     // Handle file_url upload (if using local storage)
  //     if (fileUrl) {
  //       const { data: fileUrlData, error: fileUrlError } =
  //         await this.supabaseService.supabaseClient.storage
  //           .from('files')
  //           .upload(thumbnail.originalname, thumbnail.buffer, {
  //             contentType: thumbnail.mimetype,
  //           });

  //       if (fileUrlError) {
  //         throw new Error(fileUrlError.message);
  //       }

  //       fileUrlPath = fileUrlData.fullPath;
  //     }
  //     // Update createAudioPodcastDto with thumbnailUrl and fileUrlPath
  //     createAudioPodcastDto.thumbnail = thumbnailUrl;
  //     createAudioPodcastDto.file_url = fileUrlPath; // Optional (if using local storage)
  //     return this.audioPodcastsService.create(createAudioPodcastDto);
  //   } catch (error) {
  //     // Handle errors gracefully
  //     console.error(error);
  //     throw new Error('Error uploading audio podcast');
  //   }
  // }

  @Get()
  @ApiOkResponse({
    type: AudioPodcast,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.audioPodcastsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateAudioPodcastDto: UpdateAudioPodcastDto,
  ) {
    return this.audioPodcastsService.update(uuid, updateAudioPodcastDto);
  }

  @Delete(':uuid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.remove(uuid);
  }
}
