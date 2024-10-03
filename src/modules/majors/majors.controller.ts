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
  UseGuards,
} from '@nestjs/common';
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Major } from './entities/major.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
@ApiTags('Major')
@Controller({ path: 'api/majors', version: '1' })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Major,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorsService.create(createMajorDto);
  }

  @Get()
  @ApiOkResponse({
    type: Major,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.majorsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    type: Major,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.majorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: Major,
  })
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
    return this.majorsService.update(id, updateMajorDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: Major,
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.majorsService.remove(id);
  }
}
