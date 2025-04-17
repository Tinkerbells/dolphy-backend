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
} from '@nestjs/swagger';
import { Card } from './domain/card';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCardsDto } from './dto/find-all-cards.dto';
import { RatingType, ratings } from '../review-logs/domain/review-log';
import { FsrsService } from '../fsrs/fsrs.service';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'cards',
  version: '1',
})
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly fsrsService: FsrsService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Card,
  })
  create(@Body() createCardDto: CreateCardDto, @Request() req) {
    return this.cardsService.create(createCardDto, req.user.id);
  }

  @Post('batch')
  @ApiCreatedResponse({
    type: [Card],
  })
  createBatch(@Body() createCardDtos: CreateCardDto[], @Request() req) {
    return this.cardsService.createMany(createCardDtos, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Card),
  })
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

  @Get('due')
  @ApiOkResponse({
    type: [Card],
  })
  async findDue(@Request() req) {
    return this.cardsService.findDueCards(req.user.id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Card,
  })
  findOne(@Param('id') id: string) {
    return this.cardsService.findWithContent(id);
  }

  @Get(':id/preview')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async preview(@Param('id') id: string) {
    const card = await this.cardsService.findById(id);
    if (!card) {
      return null;
    }

    return this.fsrsService.previewRatings(card);
  }

  @Post(':id/grade')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  grade(@Param('id') id: string, @Body() body: { rating: RatingType }) {
    // Проверяем, валидна ли оценка
    if (!ratings.includes(body.rating)) {
      throw new Error('Invalid rating');
    }

    return this.cardsService.grade(id, body.rating);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Card,
  })
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Post(':id/reset')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  reset(@Param('id') id: string) {
    return this.cardsService.reset(id);
  }

  @Post(':id/suspend')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  suspend(@Param('id') id: string, @Body() body: { until: Date }) {
    return this.cardsService.suspend(id, body.until);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.cardsService.softDelete(id);
  }

  @Post(':id/restore')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  restore(@Param('id') id: string) {
    return this.cardsService.restore(id);
  }
}
