import { ApiProperty } from '@nestjs/swagger';

export class Deck {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'Японский язык',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'Колода для изучения японских иероглифов',
  })
  description: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  deleted: boolean;

  @ApiProperty({
    type: String,
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
