import { Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}
  async ratingContent(uuid: string, createRatingDto: CreateRatingDto) {
    const content = await this.prisma.contents.findUniqueOrThrow({
      where: { uuid },
    });
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { uuid: createRatingDto.rating_by },
    });

    if (createRatingDto.rating_value < 1 || createRatingDto.rating_value > 5) {
      throw new Error('Rating value must be between 1 and 5.');
    }

    const rating = await this.prisma.ratings.create({
      data: {
        content: { connect: { id: content.id } },
        user: { connect: { id: user.id } },
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

  async updateRating(uuid: string, updateRatingDto: UpdateRatingDto) {
    if (updateRatingDto.rating_value < 1 || updateRatingDto.rating_value > 5) {
      throw new Error('Rating value must be between 1 and 5.');
    }

    await this.prisma.users.findUniqueOrThrow({
      where: { uuid: updateRatingDto.rating_by },
    });

    const rating = await this.prisma.ratings.update({
      where: { uuid },
      data: { rating_value: updateRatingDto.rating_value },
    });

    return {
      status: 'success',
      message: 'Rating update successfully',
      data: {
        uuid: rating.uuid,
      },
    };
  }
}
