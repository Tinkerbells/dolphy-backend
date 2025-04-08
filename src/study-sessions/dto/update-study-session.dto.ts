// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateStudySessionDto } from './create-study-session.dto';

export class UpdateStudySessionDto extends PartialType(CreateStudySessionDto) {}
