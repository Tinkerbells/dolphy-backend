import { PartialType } from '@nestjs/swagger';
import { CreateStatisticDto } from './create-statistic.dto';

/**
 * DTO для обновления записи статистики
 * Наследуется от CreateStatisticDto, но делает все поля опциональными
 */
export class UpdateStatisticDto extends PartialType(CreateStatisticDto) {}
