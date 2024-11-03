import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';

@ApiTags('Rating & Comment')
@Controller({ path: 'api/v1/ratings', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user', 'staff', 'judges')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':uuid/rating')
  create(
    @Param('uuid') uuid: string,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.ratingContent(uuid, createRatingDto);
  }

  @Patch(':uuid/update-rating')
  update(
    @Param('uuid') uuid: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(uuid, updateRatingDto);
  }
}
