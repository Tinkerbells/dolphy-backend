import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { Statistic } from './domain/statistic';
import { FindAllStatisticsDto } from './dto/find-all-statistics.dto';
import { GetAnalyticsDto, TimeInterval } from './dto/get-analytics.dto';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from 'src/utils/types/nullable.type';

/**
 * Контроллер для работы со статистикой обучения
 */
@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  /**
   * Конструктор
   * @param statisticsService Сервис статистики
   */
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * Создать новую запись статистики
   * @param req Запрос
   * @param createStatisticDto DTO с данными для создания
   */
  @Post()
  @ApiOperation({ summary: 'Создать новую запись статистики' })
  @ApiCreatedResponse({
    description: 'Запись статистики успешно создана',
    type: Statistic,
  })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req,
    @Body() createStatisticDto: CreateStatisticDto,
  ): Promise<Statistic> {
    return this.statisticsService.create(req.user.id, createStatisticDto);
  }

  /**
   * Получить список статистики с пагинацией и фильтрацией
   * @param req Запрос
   * @param query Параметры запроса
   */
  @Get()
  @ApiOperation({ summary: 'Получить список статистики' })
  @ApiOkResponse({
    description: 'Список статистики',
    type: InfinityPaginationResponse(Statistic),
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Request() req,
    @Query() query: FindAllStatisticsDto,
  ): Promise<InfinityPaginationResponseDto<Statistic>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    // Преобразуем даты из строк в объекты Date
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate) {
      startDate = new Date(query.startDate);
    }

    if (query.endDate) {
      endDate = new Date(query.endDate);
      // Устанавливаем конец дня для включения всех записей указанного дня
      endDate.setHours(23, 59, 59, 999);
    }

    const { data, total } = await this.statisticsService.findAll({
      uid: req.user.id,
      type: query.type,
      did: query.did,
      dids: query.dids,
      cid: query.cid,
      startDate,
      endDate,
      page,
      limit,
    });

    return {
      data,
      hasNextPage: page * limit < total,
    };
  }

  /**
   * Получить запись статистики по ID
   * @param req Запрос
   * @param id ID записи
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить запись статистики по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID записи статистики',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Запись статистики',
    type: Statistic,
  })
  @HttpCode(HttpStatus.OK)
  findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<NullableType<Statistic>> {
    return this.statisticsService.findById(id, req.user.id);
  }

  /**
   * Обновить запись статистики
   * @param req Запрос
   * @param id ID записи
   * @param updateStatisticDto DTO с данными для обновления
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить запись статистики' })
  @ApiParam({
    name: 'id',
    description: 'ID записи статистики',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Обновленная запись статистики',
    type: Statistic,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatisticDto: UpdateStatisticDto,
  ): Promise<NullableType<Statistic>> {
    return this.statisticsService.update(id, req.user.id, updateStatisticDto);
  }

  /**
   * Удалить запись статистики
   * @param req Запрос
   * @param id ID записи
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запись статистики' })
  @ApiParam({
    name: 'id',
    description: 'ID записи статистики',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req, @Param('id') id: string): Promise<boolean> {
    return this.statisticsService.remove(id, req.user.id);
  }

  /**
   * Получить ежедневную статистику
   * @param req Запрос
   * @param date Дата (в формате YYYY-MM-DD)
   * @param did ID колоды (опционально)
   */
  @Get('daily')
  @ApiOperation({ summary: 'Получить ежедневную статистику' })
  @ApiQuery({
    name: 'date',
    description: 'Дата в формате YYYY-MM-DD',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'did',
    description: 'ID колоды',
    type: Number,
    required: false,
  })
  @ApiOkResponse({
    description: 'Ежедневная статистика',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        totalReviews: { type: 'number' },
        correctAnswers: { type: 'number' },
        incorrectAnswers: { type: 'number' },
        accuracyRate: { type: 'number' },
        totalTimeSpentMs: { type: 'number' },
        newCards: { type: 'number' },
        learningCards: { type: 'number' },
        reviewCards: { type: 'number' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getDailyStatistics(
    @Request() req,
    @Query('date') dateString: string,
    @Query('did') did?: number,
  ): Promise<Record<string, any>> {
    // Преобразуем строку даты в объект Date
    const date = new Date(dateString);

    // Проверяем корректность даты
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }

    return this.statisticsService.getDailyStatistics(req.user.id, date, did);
  }

  /**
   * Получить аналитические данные
   * @param req Запрос
   * @param query Параметры запроса
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Получить аналитические данные' })
  @ApiOkResponse({
    description: 'Аналитические данные',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getAnalytics(
    @Request() req,
    @Query() query: GetAnalyticsDto,
  ): Promise<any[]> {
    // Преобразуем даты из строк в объекты Date
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate) {
      startDate = new Date(query.startDate);
    }

    if (query.endDate) {
      endDate = new Date(query.endDate);
      // Устанавливаем конец дня для включения всех записей указанного дня
      endDate.setHours(23, 59, 59, 999);
    }

    return this.statisticsService.getAnalytics({
      uid: req.user.id,
      type: query.type!,
      did: query.did,
      dids: query.dids,
      startDate,
      endDate,
      interval: query.interval || TimeInterval.DAY,
      limit: query.limit,
    });
  }

  /**
   * Экспортировать данные статистики
   * @param req Запрос
   * @param query Параметры запроса
   */
  @Get('export')
  @ApiOperation({ summary: 'Экспортировать данные статистики' })
  @ApiQuery({
    name: 'type',
    description: 'Тип статистики',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'did',
    description: 'ID колоды',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'cid',
    description: 'ID карточки',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Дата начала в формате YYYY-MM-DD',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Дата окончания в формате YYYY-MM-DD',
    type: String,
    required: false,
  })
  @ApiOkResponse({
    description: 'Экспортированные данные статистики',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async exportStatistics(
    @Request() req,
    @Query('type') type?: string,
    @Query('did') did?: number,
    @Query('cid') cid?: number,
    @Query('startDate') startDateString?: string,
    @Query('endDate') endDateString?: string,
  ): Promise<any[]> {
    // Преобразуем даты из строк в объекты Date
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateString) {
      startDate = new Date(startDateString);
    }

    if (endDateString) {
      endDate = new Date(endDateString);
      // Устанавливаем конец дня для включения всех записей указанного дня
      endDate.setHours(23, 59, 59, 999);
    }

    return this.statisticsService.exportStatistics({
      uid: req.user.id,
      type,
      did,
      cid,
      startDate,
      endDate,
    });
  }

  /**
   * Записать информацию о повторении карточки
   * @param req Запрос
   * @param did ID колоды
   * @param cid ID карточки
   * @param isCorrect Флаг успешного ответа
   * @param timeSpentMs Время, затраченное на ответ (мс)
   * @param cardState Состояние карточки
   */
  @Post('record/card-review')
  @ApiOperation({ summary: 'Записать информацию о повторении карточки' })
  @ApiCreatedResponse({
    description: 'Информация о повторении успешно записана',
    type: Statistic,
  })
  @HttpCode(HttpStatus.CREATED)
  recordCardReview(
    @Request() req,
    @Body('did') did: number,
    @Body('cid') cid: number,
    @Body('isCorrect') isCorrect: boolean,
    @Body('timeSpentMs') timeSpentMs: number,
    @Body('cardState') cardState: number,
  ): Promise<Statistic> {
    return this.statisticsService.recordCardReview(
      req.user.id,
      cid,
      did,
      isCorrect,
      timeSpentMs,
      cardState,
    );
  }

  /**
   * Записать информацию о начале сессии обучения
   * @param req Запрос
   * @param did ID колоды
   * @param totalCards Общее количество карточек
   */
  @Post('record/session-start')
  @ApiOperation({ summary: 'Записать информацию о начале сессии обучения' })
  @ApiCreatedResponse({
    description: 'Информация о начале сессии успешно записана',
    type: Statistic,
  })
  @HttpCode(HttpStatus.CREATED)
  recordStudySessionStart(
    @Request() req,
    @Body('did') did: number,
    @Body('totalCards') totalCards: number,
  ): Promise<Statistic> {
    return this.statisticsService.recordStudySessionStart(
      req.user.id,
      did,
      totalCards,
    );
  }

  /**
   * Обновить информацию о сессии обучения
   * @param req Запрос
   * @param id ID записи статистики
   * @param cardsCompleted Количество завершенных карточек
   * @param cardsCorrect Количество правильных ответов
   * @param isCompleted Флаг завершения сессии
   */
  @Patch('record/session-update/:id')
  @ApiOperation({ summary: 'Обновить информацию о сессии обучения' })
  @ApiParam({
    name: 'id',
    description: 'ID записи статистики',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Информация о сессии успешно обновлена',
    type: Statistic,
  })
  @HttpCode(HttpStatus.OK)
  updateStudySession(
    @Request() req,
    @Param('id') id: string,
    @Body('cardsCompleted') cardsCompleted: number,
    @Body('cardsCorrect') cardsCorrect: number,
    @Body('isCompleted') isCompleted: boolean,
  ): Promise<NullableType<Statistic>> {
    return this.statisticsService.updateStudySession(
      id,
      req.user.id,
      cardsCompleted,
      cardsCorrect,
      isCompleted,
    );
  }
}
