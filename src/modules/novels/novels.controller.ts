import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { Novel } from './entities/novel.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Contents')
@Controller({ path: 'api/contents/novels', version: '1' })
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNovelDto: CreateNovelDto) {
    return this.novelsService.create(createNovelDto);
  }

  @Get()
  @ApiOkResponse({
    type: Novel,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.novelsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.novelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateNovelDto: UpdateNovelDto) {
    return this.novelsService.update(id, updateNovelDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: Novel,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.novelsService.remove(id);
  }
}
