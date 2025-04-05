import { ApiProperty } from '@nestjs/swagger';

export interface DailyStatItem {
  date: string;
  total: number;
  correct: number;
  percentage: number;
}

export class SummaryResponseDto {
  @ApiProperty()
  totalAnswers: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  correctPercentage: number;

  @ApiProperty()
  studiedDecksCount: number;

  @ApiProperty({ type: [Object] })
  last30Days: DailyStatItem[];
}

export class DeckSummaryResponseDto {
  @ApiProperty()
  totalAnswers: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  correctPercentage: number;

  @ApiProperty()
  averageTimeMs: number;

  @ApiProperty({ type: [Object] })
  last30Days: DailyStatItem[];
}
