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
} from '@nestjs/swagger';
import { MarketDeck } from './domain/market-deck';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllMarketDecksDto } from './dto/find-all-market-decks.dto';

@ApiTags('Marketdecks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'market-decks',
  version: '1',
})
export class MarketDecksController {
  constructor(private readonly marketDecksService: MarketDecksService) {}

  @Post()
  @ApiCreatedResponse({
    type: MarketDeck,
  })
  create(@Body() createMarketDeckDto: CreateMarketDeckDto) {
    return this.marketDecksService.create(createMarketDeckDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(MarketDeck),
  })
  async findAll(
    @Query() query: FindAllMarketDecksDto,
  ): Promise<InfinityPaginationResponseDto<MarketDeck>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.marketDecksService.findAllWithPagination({
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
    type: MarketDeck,
  })
  findById(@Param('id') id: string) {
    return this.marketDecksService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: MarketDeck,
  })
  update(
    @Param('id') id: string,
    @Body() updateMarketDeckDto: UpdateMarketDeckDto,
  ) {
    return this.marketDecksService.update(id, updateMarketDeckDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.marketDecksService.remove(id);
  }
}
