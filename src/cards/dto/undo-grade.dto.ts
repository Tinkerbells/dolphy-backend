import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UndoGradeDto {
  @ApiProperty({
    description: 'ID лога повторения, который нужно отменить',
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @IsUUID('4')
  @IsNotEmpty()
  reviewLogId: string;
}
