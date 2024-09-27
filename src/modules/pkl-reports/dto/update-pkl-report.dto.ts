import { PartialType } from '@nestjs/swagger';
import { CreatePklReportDto } from './create-pkl-report.dto';

export class UpdatePklReportDto extends PartialType(CreatePklReportDto) {}
