import { PartialType } from '@nestjs/swagger';
import { CreateFsrsDto } from './create-fsrs.dto';

export class UpdateFsrsDto extends PartialType(CreateFsrsDto) {
  // Пустой DTO для совместимости
}
