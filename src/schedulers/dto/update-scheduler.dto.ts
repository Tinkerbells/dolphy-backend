// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateSchedulerDto } from './create-scheduler.dto';

export class UpdateSchedulerDto extends PartialType(CreateSchedulerDto) {}
