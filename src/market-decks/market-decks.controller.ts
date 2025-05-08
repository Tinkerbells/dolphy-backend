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
  NotFoundException,
} from '@nestjs/common';
import { MarketDecksService } from './market-decks.service';
import { CreateMarketDeckDto } from './dto/create-market-deck.dto';
import { UpdateMarketDeckDto } from './dto/update-market-deck.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { MarketDeck } from './domain/market-deck';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllMarketDecksDto } from './dto/find-all-market-decks.dto';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from '../utils/i18n';

@ApiTags('Market Decks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'market/decks',
  version: '1',
})
export class MarketDecksController {
  constructor(private readonly marketDecksService: MarketDecksService) {}

  @Post()
  @ApiOperation({ summary: 'Опубликовать колоду в маркетплейсе' })
  @ApiCreatedResponse({
    type: MarketDeck,
    description: 'Колода успешно опубликована',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMarketDeckDto: CreateMarketDeckDto, @Request() req) {
    return this.marketDecksService.create(createMarketDeckDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список опубликованных колод' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(MarketDeck),
    description: 'Список колод с пагинацией',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindAllMarketDecksDto,
  ): Promise<InfinityPaginationResponseDto<MarketDeck>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    try {
      const marketDecks =
        await this.marketDecksService.findAllWithPagination(query);
      return infinityPagination(marketDecks, { page, limit });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(t('market-decks.notFound'));
      }
      throw new BadRequestException(t('common.error'));
    }
  }

  @Get('popular')
  @ApiOperation({ summary: 'Получить популярные колоды' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(MarketDeck),
    description: 'Список популярных колод',
  })
  @HttpCode(HttpStatus.OK)
  async findPopular(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy: 'downloadCount' | 'rating' = 'downloadCount',
  ): Promise<InfinityPaginationResponseDto<MarketDeck>> {
    if (limit > 50) {
      limit = 50;
    }

    const marketDecks = await this.marketDecksService.findPopular({
      paginationOptions: { page, limit },
      sortBy,
    });
    return infinityPagination(marketDecks, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о конкретной колоде' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID колоды в маркетплейсе',
  })
  @ApiOkResponse({
    type: MarketDeck,
    description: 'Детальная информация о колоде',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.marketDecksService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить информацию о колоде' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID колоды в маркетплейсе',
  })
  @ApiOkResponse({
    type: MarketDeck,
    description: 'Обновленная информация о колоде',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateMarketDeckDto: UpdateMarketDeckDto,
    @Request() req,
  ) {
    return this.marketDecksService.update(id, updateMarketDeckDto, req.user.id);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Скопировать колоду к себе' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID колоды в маркетплейсе',
  })
  @ApiOkResponse({
    description: 'ID новой колоды',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
        },
        message: {
          type: 'string',
          example: 'Deck copied successfully',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async copyDeck(@Param('id') id: string, @Request() req) {
    try {
      const result = await this.marketDecksService.copyDeck(id, req.user.id);
      return {
        ...result,
        message: t('market-decks.copied'),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(t('market-decks.notFound'));
      }
      throw new BadRequestException(t('common.error'));
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить колоду из маркетплейса' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID колоды в маркетплейсе',
  })
  @ApiOkResponse({
    type: OperationResultDto,
    description: 'Market deck successfully deleted',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    return this.marketDecksService.remove(id, req.user.id);
  }
}
