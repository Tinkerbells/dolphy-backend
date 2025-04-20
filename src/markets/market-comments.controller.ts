import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarketCommentsService } from './market-comments.service';
import { CreateMarketCommentDto } from './dto/create-market-comment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { MarketComment } from './domain/market-comment';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllMarketCommentsDto } from './dto/find-all-market-comments.dto';

@ApiTags('Market Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'market/comments',
  version: '1',
})
export class MarketCommentsController {
  constructor(private readonly marketCommentsService: MarketCommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить комментарий к колоде' })
  @ApiCreatedResponse({
    type: MarketComment,
    description: 'Комментарий успешно добавлен',
  })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createMarketCommentDto: CreateMarketCommentDto,
    @Request() req,
  ) {
    return this.marketCommentsService.create(
      createMarketCommentDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить список комментариев' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(MarketComment),
    description: 'Список комментариев с пагинацией',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindAllMarketCommentsDto,
  ): Promise<InfinityPaginationResponseDto<MarketComment>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const marketComments =
      await this.marketCommentsService.findAllWithPagination(query);

    return infinityPagination(marketComments, { page, limit });
  }

  @Get('deck/:marketDeckId')
  @ApiOperation({ summary: 'Получить комментарии к конкретной колоде' })
  @ApiParam({
    name: 'marketDeckId',
    type: String,
    required: true,
    description: 'ID колоды в маркетплейсе',
  })
  @ApiOkResponse({
    type: [MarketComment],
    description: 'Список комментариев к колоде',
  })
  @HttpCode(HttpStatus.OK)
  findByMarketDeckId(@Param('marketDeckId') marketDeckId: string) {
    return this.marketCommentsService.findByMarketDeckId(marketDeckId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить конкретный комментарий' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID комментария',
  })
  @ApiOkResponse({
    type: MarketComment,
    description: 'Детальная информация о комментарии',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.marketCommentsService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID комментария',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.marketCommentsService.remove(id, req.user.id);
  }
}
