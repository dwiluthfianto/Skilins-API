import { PartialType } from '@nestjs/swagger';
import { ContentDto } from './content.dto';

export class UpdateContentDto extends PartialType(ContentDto) {}
