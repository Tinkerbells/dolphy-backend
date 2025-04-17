import { PartialType } from '@nestjs/swagger';
import { CreateReviewLogDto } from './create-review-log.dto';

export class UpdateReviewLogDto extends PartialType(CreateReviewLogDto) {}
