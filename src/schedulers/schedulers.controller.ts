import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SchedulersService } from './schedulers.service';
import { NextReviewDto } from './dto/next-review.dto';
import { ForgetCardDto } from './dto/forget-card.dto';
import { UndoReviewDto } from './dto/undo-review.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { SuspendCardDto } from './dto/suspend-card.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { State } from 'ts-fsrs';
import { ReviewResult } from './domain/review-result';
import { AuthGuard } from '@nestjs/passport';
import { StatisticsService } from 'src/statistics/statistics.service';

@ApiTags('Scheduler')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'scheduler',
  version: '1',
})
export class SchedulerController {
  constructor(
    private readonly schedulerService: SchedulersService,
    private readonly statisticsService: StatisticsService,
  ) {}

  @Get('due-cards')
  @ApiOperation({ summary: 'Получить карточки для повторения' })
  @ApiQuery({
    name: 'timestamp',
    type: Number,
    required: false,
    description: 'Текущее время (timestamp)',
  })
  @ApiQuery({
    name: 'dids',
    type: [Number],
    required: false,
    description: 'Фильтр по ID колод',
  })
  @ApiQuery({
    name: 'source',
    type: [String],
    required: false,
    description: 'Фильтр по источникам',
  })
  @ApiOkResponse({
    description: 'Карточки для повторения, сгруппированные по состояниям',
  })
  async getDueCards(
    @Request() req,
    @Query('timestamp') timestamp = Date.now(),
    @Query('dids') dids?: number[],
    @Query('source') source?: string[],
  ) {
    // Получаем статистику по сегодняшним повторениям
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await this.statisticsService.getRangeRevlogCount(
      req.user.id,
      [today.getTime(), tomorrow.getTime()],
      [State.New, State.Learning, State.Review, State.Relearning],
      dids,
    );

    // Получаем карточки для повторения
    const cards = await this.schedulerService.getReviewCardDetails(
      req.user.id,
      +timestamp,
      todayCount,
      { dids, source },
    );

    return {
      new: cards.get(State.New) || [],
      learning: cards.get(State.Learning) || [],
      relearning: cards.get(State.Relearning) || [],
      review: cards.get(State.Review) || [],
    };
  }

  @Post('review')
  @ApiOperation({ summary: 'Зафиксировать ответ на карточку' })
  @ApiBody({ type: NextReviewDto })
  @ApiOkResponse({ type: ReviewResult })
  async nextReview(@Request() req, @Body() dto: NextReviewDto) {
    return this.schedulerService.next(
      req.user.id,
      dto.cid,
      dto.timestamp,
      dto.rating,
      dto.offset,
      dto.duration,
    );
  }

  @Post('forget')
  @ApiOperation({ summary: 'Сбросить прогресс карточки' })
  @ApiBody({ type: ForgetCardDto })
  @ApiOkResponse({ type: ReviewResult })
  async forgetCard(@Request() req, @Body() dto: ForgetCardDto) {
    const timestamp = Date.now();
    return this.schedulerService.forget(
      req.user.id,
      dto.cid,
      timestamp,
      0, // offset
      dto.reset_count,
    );
  }

  @Delete('review')
  @ApiOperation({ summary: 'Отменить последнее повторение' })
  @ApiBody({ type: UndoReviewDto })
  @ApiOkResponse({ type: ReviewResult })
  async undoReview(@Request() req, @Body() dto: UndoReviewDto) {
    return this.schedulerService.undo(req.user.id, dto.cid, dto.lid);
  }

  @Post('suspend')
  @ApiOperation({ summary: 'Приостановить/возобновить карточку' })
  @ApiBody({ type: SuspendCardDto })
  @ApiOkResponse({ type: ReviewResult })
  async suspendCard(@Request() req, @Body() dto: SuspendCardDto) {
    const timestamp = Date.now();
    return this.schedulerService.switchSuspend(
      req.user.id,
      dto.cid,
      timestamp,
      dto.suspended,
    );
  }

  @Put('reschedule')
  @ApiOperation({ summary: 'Перепланировать карточки' })
  @ApiBody({ type: RescheduleDto })
  @ApiOkResponse({ description: 'Список ID перепланированных карточек' })
  async rescheduleCards(@Request() req, @Body() dto: RescheduleDto) {
    const rescheduledCards = await this.schedulerService.reschedule(
      req.user.id,
      dto.cids,
      dto.parameters,
    );
    return { reschedule: rescheduledCards };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику повторений' })
  @ApiQuery({
    name: 'start',
    type: Number,
    required: true,
    description: 'Начальная дата (timestamp)',
  })
  @ApiQuery({
    name: 'end',
    type: Number,
    required: true,
    description: 'Конечная дата (timestamp)',
  })
  @ApiQuery({
    name: 'dids',
    type: [Number],
    required: false,
    description: 'Фильтр по ID колод',
  })
  @ApiOkResponse({ description: 'Статистика повторений по состояниям' })
  async getStatistics(
    @Request() req,
    @Query('start') start: number,
    @Query('end') end: number,
    @Query('dids') dids?: number[],
  ) {
    const stats = await this.statisticsService.getRangeRevlogCount(
      req.user.id,
      [+start, +end],
      [State.New, State.Learning, State.Review, State.Relearning],
      dids,
    );

    return {
      new: stats.get(State.New) || 0,
      learning: stats.get(State.Learning) || 0,
      relearning: stats.get(State.Relearning) || 0,
      review: stats.get(State.Review) || 0,
      total: [...stats.values()].reduce((sum, count) => sum + count, 0),
    };
  }

  @Get('export-logs')
  @ApiOperation({ summary: 'Экспортировать логи повторений' })
  @ApiQuery({
    name: 'start',
    type: Number,
    required: false,
    description: 'Начальная дата (timestamp)',
  })
  @ApiQuery({
    name: 'end',
    type: Number,
    required: false,
    description: 'Конечная дата (timestamp)',
  })
  @ApiOkResponse({ description: 'Экспорт логов для анализа' })
  async exportLogs(
    @Request() req,
    @Query('start') start?: number,
    @Query('end') end?: number,
  ) {
    const timeRange =
      start && end ? ([+start, +end] as [number, number]) : undefined;
    return this.statisticsService.exportLogs(req.user.id, timeRange);
  }
}
