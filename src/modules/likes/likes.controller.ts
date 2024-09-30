import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
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
