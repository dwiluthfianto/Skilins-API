import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { UuidHelper } from 'src/common/helpers/uuid.helper';
import { SlugHelper } from 'src/common/helpers/generate-unique-slug';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, UuidHelper, SlugHelper],
})
export class StoriesModule {}
