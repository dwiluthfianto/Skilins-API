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
} from '@nestjs/common';
import { AudioPodcastsService } from './audio-podcasts.service';
import { CreateAudioPodcastDto } from './dto/create-audio-podcast.dto';
import { UpdateAudioPodcastDto } from './dto/update-audio-podcast.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AudioPodcast } from './entities/audio-podcast.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { SupabaseService } from 'src/supabase/supabase.service';

@ApiTags('Contents')
@Controller({ path: 'api/contents/audios', version: '1' })
export class AudioPodcastsController {
  constructor(
    private readonly audioPodcastsService: AudioPodcastsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      limits: { fileSize: 1024 * 1024 * 5 }, // Set maximum thumbnail size (5 MB)
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new MulterError('LIMIT_UNEXPECTED_FILE', 'Unsupported file format'),
            true,
          );
        }
        callback(null, true);
      },
    }),
    FileInterceptor('file_url', {
      limits: { fileSize: 1024 * 1024 * 5 }, // Set maximum thumbnail size (5 MB)
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(
            new MulterError('LIMIT_UNEXPECTED_FILE', 'Unsupported file format'),
            true,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiCreatedResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile('thumbnail') thumbnail: Express.Multer.File,
    @UploadedFile('file_url') fileUrl: Express.Multer.File,
    @Body() createAudioPodcastDto: CreateAudioPodcastDto,
  ) {
    // Handle potential upload errors (e.g., size limit exceeded, invalid format)
    if (thumbnail && thumbnail instanceof MulterError) {
      throw new Error(thumbnail.message);
    }

    // Handle file_url upload errors (if using local storage)

    let thumbnailUrl;
    let fileUrlPath; // Optional (if using local storage)

    try {
      if (thumbnail) {
        const { data: thumbnailData, error: thumbnailError } =
          await this.supabaseService.supabaseClient.storage
            .from('thumbnails')
            .upload(thumbnail.originalname, thumbnail.buffer, {
              contentType: thumbnail.mimetype,
            });

        if (thumbnailError) {
          throw new Error(thumbnailError.message);
        }

        thumbnailUrl = thumbnailData.fullPath;
      }

      // Handle file_url upload (if using local storage)
      if (fileUrl) {
        const { data: fileUrlData, error: fileUrlError } =
          await this.supabaseService.supabaseClient.storage
            .from('files')
            .upload(thumbnail.originalname, thumbnail.buffer, {
              contentType: thumbnail.mimetype,
            });

        if (fileUrlError) {
          throw new Error(fileUrlError.message);
        }

        fileUrlPath = fileUrlData.fullPath;
      }
      // Update createAudioPodcastDto with thumbnailUrl and fileUrlPath
      createAudioPodcastDto.thumbnail = thumbnailUrl;
      createAudioPodcastDto.file_url = fileUrlPath; // Optional (if using local storage)
      return this.audioPodcastsService.create(createAudioPodcastDto);
    } catch (error) {
      // Handle errors gracefully
      console.error(error);
      throw new Error('Error uploading audio podcast');
    }
  }

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
  @ApiOkResponse({
    type: AudioPodcast,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.audioPodcastsService.remove(uuid);
  }
}
