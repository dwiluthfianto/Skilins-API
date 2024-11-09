import {
  // Body,
  Controller,
  // HttpCode,
  // HttpStatus,
  // Param,
  // Patch,
  // UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { Roles } from '../roles/roles.decorator';
// import { ContentApproveDto } from './dto/content-approve.dto';

@ApiTags('Contents')
@Controller({ path: 'api/v1/contents', version: '1' })
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  // @Patch(':uuid')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('Staff')
  // @HttpCode(HttpStatus.OK)
  // async approveContent(
  //   @Param('uuid') uuid: string,
  //   @Body() contentApproveDto: ContentApproveDto,
  // ) {
  //   return this.contentsService.approveContent(uuid, contentApproveDto);
  // }
}
