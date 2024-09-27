import { Injectable } from '@nestjs/common';
import { UpdateContentDto } from './dto/update-content.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContentsService {
  constructor(private prisma: PrismaService) {}

  update(id: number, updateContentDto: UpdateContentDto) {
    return `This action updates a #${id} content`;
  }

  remove(id: number) {
    return `This action removes a #${id} content`;
  }
}
