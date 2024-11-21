import { Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}
  async ratingContent(
    userUuid: string,
    contentUuid: string,
    createRatingDto: CreateRatingDto,
  ) {
    if (createRatingDto.rating_value < 1 || createRatingDto.rating_value > 5) {
      throw new Error('Rating value must be between 1 and 5.');
    }

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: userUuid },
      select: {
        id: true,
      },
    });

    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: contentUuid },
      select: {
        id: true,
      },
    });

    const rating = await this.prisma.ratings.upsert({
      where: {
        ratingContent: {
          content_id: content.id,
          rating_by: user.id,
        },
      },
      update: {
        rating_value: createRatingDto.rating_value,
      },
      create: {
        content_id: content.id,
        rating_by: user.id,
        rating_value: createRatingDto.rating_value,
      },
    });

    return {
      status: 'success',
      message: 'Successfully give a rating',
      data: {
        uuid: rating.uuid,
      },
    };
  }

  async getUserRating(contentUuid: string, userUuid: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: userUuid },
      select: {
        id: true,
      },
    });

    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid: contentUuid },
      select: {
        id: true,
      },
    });
    return this.prisma.ratings.findUnique({
      where: {
        ratingContent: { content_id: content.id, rating_by: user.id },
      },
    });
  }
}
