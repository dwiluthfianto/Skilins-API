import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ContentStatus } from '@prisma/client';

@ApiTags('Contents')
@Controller({ path: 'api/v1/contents', version: '1' })
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Patch(':contentUuid/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @HttpCode(HttpStatus.OK)
  async approveContent(@Param('contentUuid') contentUuid: string) {
    return this.contentsService.updateContentStatus(
      contentUuid,
      ContentStatus.APPROVED,
    );
  }

  @Patch(':contentUuid/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Staff')
  @HttpCode(HttpStatus.OK)
  async rejectContent(@Param('contentUuid') contentUuid: string) {
    return this.contentsService.updateContentStatus(
      contentUuid,
      ContentStatus.REJECTED,
    );
  }
}
