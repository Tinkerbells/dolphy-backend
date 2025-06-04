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
  BadRequestException,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Card } from './domain/card';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCardsDto } from './dto/find-all-cards.dto';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from '../utils/i18n';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'cards',
  version: '1',
})
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую карточку' })
  @ApiCreatedResponse({
    type: Card,
    description: 'Карточка успешно создана',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCardDto: CreateCardDto, @Request() req) {
    return this.cardsService.create(createCardDto, req.user.id);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Создать несколько карточек одновременно' })
  @ApiCreatedResponse({
    type: [Card],
    description: 'Карточки успешно созданы',
  })
  @HttpCode(HttpStatus.CREATED)
  createBatch(@Body() createCardDtos: CreateCardDto[], @Request() req) {
    return this.cardsService.createMany(createCardDtos, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список карточек с пагинацией' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(Card),
    description: 'Список карточек с пагинацией',
  })
  @ApiQuery({ type: FindAllCardsDto })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindAllCardsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Card>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const cards = await this.cardsService.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      userId: req.user.id,
      deckId: query.deckId,
    });

    return infinityPagination(cards, { page, limit });
  }

  @Get('deck/:deckId')
  @ApiOperation({
    summary: 'Получить карточки из конкретной колоды',
  })
  @ApiParam({
    name: 'deckId',
    description: 'ID колоды',
    type: String,
  })
  @ApiOkResponse({
    type: [Card],
    description: 'Карточки из указанной колоды',
  })
  @HttpCode(HttpStatus.OK)
  async findByDeckId(@Param('deckId') deckId: string) {
    return this.cardsService.findByDeckId(deckId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить карточку по ID' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: Card,
    description: 'Карточка с контентом',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const card = await this.cardsService.findById(id);
    if (!card) {
      throw new BadRequestException(t('cards.notFound'));
    }
    return card;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить карточку' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiBody({ type: UpdateCardDto })
  @ApiOkResponse({
    type: Card,
    description: 'Обновленная карточка',
  })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    const updatedCard = await this.cardsService.update(id, updateCardDto);
    if (!updatedCard) {
      throw new BadRequestException(t('cards.notFound'));
    }
    return updatedCard;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление карточки' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: OperationResultDto,
    description: 'Card successfully deleted',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    return this.cardsService.softDelete(id, req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Восстановить удаленную карточку' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор карточки',
  })
  @ApiOkResponse({
    type: OperationResultDto,
    description: 'Card successfully restored',
  })
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string, @Request() req) {
    return this.cardsService.restore(id, req.user.id);
  }
}
