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
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Blog } from './entities/blog.entity';

@Controller('api/contents/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  @ApiOkResponse({
    type: Blog,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid') uuid: string) {
    return this.blogsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOkResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.OK)
  update(@Param('uuid') uuid: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(uuid, updateBlogDto);
  }

  @Delete(':uuid')
  @ApiOkResponse({
    type: Blog,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.blogsService.remove(uuid);
  }
}
