import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { UpdateLikeDto } from './dto/update-like.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Like & Comment')
@Controller({ path: 'api/v1/likes', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':uuid/like')
  async likeContent(
    @Param('uuid') uuid: string,
    @Body() updateLikeDto: UpdateLikeDto,
  ) {
    return this.likesService.likeContent(uuid, updateLikeDto);
  }

  @Delete(':uuid/unlike')
  async unlikeContent(
    @Param('uuid') content_uuid: string,
    @Body() updateLikeDto: UpdateLikeDto,
  ) {
    const { liked_by } = updateLikeDto;

    return this.likesService.unlikeContent(content_uuid, liked_by);
  }
}
