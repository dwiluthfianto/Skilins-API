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
} from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Ebook } from './entities/ebook.entity';

@ApiTags('Contents')
@Controller({ path: 'api/contents/ebooks', version: '1' })
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) {}

  @Post()
  @ApiCreatedResponse({
    type: Ebook,
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEbookDto: CreateEbookDto) {
    return this.ebooksService.create(createEbookDto);
  }

  @Get()
  @ApiOkResponse({
    type: Ebook,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.ebooksService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Ebook,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.ebooksService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOkResponse({
    type: Ebook,
  })
  @HttpCode(HttpStatus.OK)
  update(@Param('uuid') uuid: string, @Body() updateEbookDto: UpdateEbookDto) {
    return this.ebooksService.update(uuid, updateEbookDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Ebook,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.ebooksService.remove(uuid);
  }
}
