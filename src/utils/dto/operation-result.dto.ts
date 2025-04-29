import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({
    example: true,
    description: 'Operation result status',
  })
  success: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Operation result message',
  })
  message: string;
}
