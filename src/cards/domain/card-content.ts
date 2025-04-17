import { ApiProperty } from '@nestjs/swagger';

export class CardContent {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  cardId: string;

  @ApiProperty({
    type: String,
    example: 'Как будет "привет" на японском?',
  })
  question: string;

  @ApiProperty({
    type: String,
    example: 'こんにちは (конничива)',
  })
  answer: string;

  @ApiProperty({
    type: String,
    example: 'obsidian',
  })
  source: string;

  @ApiProperty({
    type: String,
    example: 'file:///C:/Users/user/Documents/Obsidian/Japanese/Greetings.md',
    nullable: true,
  })
  sourceId?: string;

  @ApiProperty({
    type: Object,
    nullable: true,
  })
  extend?: Record<string, any>;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  deleted: boolean;

  @ApiProperty()
  createdAt: Date;
}
