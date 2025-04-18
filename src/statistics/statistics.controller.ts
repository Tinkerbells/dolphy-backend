import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DeckStatisticsDto } from './dto/deck-statistics.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Получить статистику пользователя по всем колодам' })
  @ApiOkResponse({
    type: UserStatisticsDto,
    description: 'Статистика пользователя по всем колодам',
  })
  @HttpCode(HttpStatus.OK)
  async getUserStatistics(@Request() req): Promise<UserStatisticsDto> {
    return this.statisticsService.getUserStatistics(req.user.id);
  }

  @Get('deck/:deckId')
  @ApiOperation({ summary: 'Получить статистику по конкретной колоде' })
  @ApiParam({
    name: 'deckId',
    type: String,
    required: true,
    description: 'ID колоды',
  })
  @ApiOkResponse({
    type: DeckStatisticsDto,
    description: 'Статистика колоды',
  })
  @HttpCode(HttpStatus.OK)
  async getDeckStatistics(
    @Param('deckId') deckId: string,
  ): Promise<DeckStatisticsDto> {
    return this.statisticsService.getDeckStatistics(deckId);
  }
}
