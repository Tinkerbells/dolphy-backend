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
import { FsrsService } from './fsrs.service';
import { UpdateFsrsDto } from './dto/update-fsrs.dto';
import { GradeCardDto } from './dto/grade-card.dto';
import { SuspendCardDto } from './dto/suspend-card.dto';
import { CardActionResponseDto } from './dto/card-action-response.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { FsrsCard, FsrsCardWithContent } from './domain/fsrs-card';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllFsrsDto } from './dto/find-all-fsrs.dto';
import { t } from '../utils/i18n';
import { User } from '../users/domain/user';

@ApiTags('FSRS')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'fsrs',
  version: '1',
})
export class FsrsController {
  constructor(private readonly fsrsService: FsrsService) {}

  @Get('due')
  @ApiOperation({ summary: 'Получить карточки для повторения пользователя' })
  @ApiOkResponse({
    type: [FsrsCard],
    description: 'Карточки, которые нужно повторить',
  })
  @HttpCode(HttpStatus.OK)
  async findDueCards(@Request() req): Promise<FsrsCardWithContent[]> {
    return await this.fsrsService.findDueCards(req.user.id);
  }

  @Get('due/deck/:deckId')
  @ApiOperation({
    summary: 'Получить карточки для повторения из конкретной колоды',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID колоды',
    type: String,
  })
  @ApiOkResponse({
    type: [FsrsCard],
    description: 'Карточки, которые нужно повторить из указанной колоды',
  })
  @HttpCode(HttpStatus.OK)
  async findDueCardsByDeckId(
    @Param('deckId') deckId: string,
  ): Promise<FsrsCardWithContent[]> {
    return this.fsrsService.findDueCardsByDeckId(deckId);
  }

  @Get('card/:cardId')
  @ApiOperation({ summary: 'Получить FSRS данные карточки' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: FsrsCard,
    description: 'FSRS данные карточки',
  })
  @HttpCode(HttpStatus.OK)
  async findByCardId(
    @Param('cardId') cardId: string,
  ): Promise<FsrsCard | null> {
    return this.fsrsService.findByCardId(cardId);
  }

  @Get('card/:cardId/preview')
  @ApiOperation({ summary: 'Предпросмотр оценок для карточки' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    description: 'Предполагаемые даты следующего повторения для каждой оценки',
  })
  @HttpCode(HttpStatus.OK)
  async previewRatings(@Param('cardId') cardId: string) {
    return this.fsrsService.previewRatings(cardId);
  }

  @Get('card/:cardId/retention')
  @ApiOperation({ summary: 'Получить вероятность запоминания карточки' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    description: 'Вероятность запоминания карточки (0-1)',
    schema: {
      type: 'object',
      properties: {
        retention: {
          type: 'number',
          example: 0.85,
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getRetentionProbability(@Param('cardId') cardId: string) {
    const retention = await this.fsrsService.getRetentionProbability(cardId);
    return { retention };
  }

  // ========== ПЕРЕНЕСЕННЫЕ МЕТОДЫ ИЗ CARDS ==========

  @Post('card/:cardId/grade')
  @ApiOperation({ summary: 'Оценить карточку и обновить ее состояние' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiBody({ type: GradeCardDto })
  @ApiOkResponse({
    type: CardActionResponseDto,
    description: 'Результат оценки карточки',
  })
  @HttpCode(HttpStatus.OK)
  async gradeCard(
    @Param('cardId') cardId: string,
    @Body() body: GradeCardDto,
    @Request() req: { user: User },
  ): Promise<CardActionResponseDto> {
    const result = await this.fsrsService.gradeCard(
      cardId,
      body.rating,
      req.user.id,
    );

    return {
      ...result,
      message: t('fsrs.success.cardGraded'),
    };
  }

  @Post('card/:cardId/suspend')
  @ApiOperation({ summary: 'Приостановить карточку до указанной даты' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiBody({ type: SuspendCardDto })
  @ApiOkResponse({
    type: CardActionResponseDto,
    description: 'Результат приостановки карточки',
  })
  @HttpCode(HttpStatus.OK)
  async suspendCard(
    @Param('cardId') cardId: string,
    @Body() body: SuspendCardDto,
    @Request() req: { user: User },
  ): Promise<CardActionResponseDto> {
    const result = await this.fsrsService.suspendCard(
      cardId,
      body.until,
      String(req.user.id),
    );

    return {
      ...result,
      message: t('fsrs.success.suspended'),
    };
  }

  @Post('card/:cardId/reset')
  @ApiOperation({ summary: 'Сбросить состояние карточки до начального' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: CardActionResponseDto,
    description: 'Карточка со сброшенным состоянием',
  })
  @HttpCode(HttpStatus.OK)
  async resetCard(
    @Param('cardId') cardId: string,
    @Request() req: { user: User },
  ): Promise<CardActionResponseDto> {
    const result = await this.fsrsService.resetCard(
      cardId,
      String(req.user.id),
    );

    return {
      ...result,
      message: t('fsrs.success.reset'),
    };
  }

  @Post('card/:cardId/undo')
  @ApiOperation({ summary: 'Отменить последнюю оценку карточки' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: CardActionResponseDto,
    description: 'Карточка с отмененной последней оценкой',
  })
  @HttpCode(HttpStatus.OK)
  async undoLastGrade(
    @Param('cardId') cardId: string,
    @Request() req: { user: User },
  ): Promise<CardActionResponseDto> {
    const result = await this.fsrsService.undoLastGrade(
      cardId,
      String(req.user.id),
    );

    return {
      ...result,
      message: t('fsrs.success.undoGrade'),
    };
  }

  // ========== ОРИГИНАЛЬНЫЕ МЕТОДЫ ==========

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(FsrsCard),
  })
  async findAll(
    @Query() query: FindAllFsrsDto,
  ): Promise<InfinityPaginationResponseDto<FsrsCard>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.fsrsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: FsrsCard,
  })
  findById(@Param('id') id: string) {
    return this.fsrsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: FsrsCard,
  })
  update(@Param('id') id: string, @Body() updateFsrsDto: UpdateFsrsDto) {
    return this.fsrsService.update(id, updateFsrsDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.fsrsService.remove(id);
  }
}
