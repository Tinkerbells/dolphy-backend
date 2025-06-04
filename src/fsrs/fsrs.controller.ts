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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { FsrsCard } from './domain/fsrs-card';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllFsrsDto } from './dto/find-all-fsrs.dto';

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
  async findDueCards(@Request() req): Promise<FsrsCard[]> {
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
  ): Promise<FsrsCard[]> {
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

  @Post('card/:cardId/reset')
  @ApiOperation({ summary: 'Сбросить состояние карточки до начального' })
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: FsrsCard,
    description: 'Карточка со сброшенным состоянием',
  })
  @HttpCode(HttpStatus.OK)
  async resetCard(@Param('cardId') cardId: string): Promise<FsrsCard> {
    return this.fsrsService.resetCard(cardId);
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
    type: FsrsCard,
    description: 'Карточка с отмененной последней оценкой',
  })
  @HttpCode(HttpStatus.OK)
  async undoLastRating(@Param('cardId') cardId: string): Promise<FsrsCard> {
    return this.fsrsService.undoLastRating(cardId);
  }

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
