import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Request } from 'express';

@ApiTags('Rating & Comment')
@Controller({ path: 'api/v1/ratings', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('User', 'Staff', 'Student', 'Judge')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':contentUuid')
  create(
    @Param('contentUuid') contentUuid: string,
    @Req() req: Request,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const user = req.user;
    return this.ratingsService.ratingContent(
      user['sub'],
      contentUuid,
      createRatingDto,
    );
  }

  @Get(':contentUuid/check')
  async getUserRating(
    @Param('contentUuid') contentUuid: string,
    @Req() req: Request,
  ) {
    const user = req.user;
    return this.ratingsService.getUserRating(contentUuid, user['sub']);
  }
}
