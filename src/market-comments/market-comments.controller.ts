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
import { MarketCommentsService } from './market-comments.service';
import { CreateMarketCommentDto } from './dto/create-market-comment.dto';
import { UpdateMarketCommentDto } from './dto/update-market-comment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MarketComment } from './domain/market-comment';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllMarketCommentsDto } from './dto/find-all-market-comments.dto';

@ApiTags('Marketcomments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'market-comments',
  version: '1',
})
export class MarketCommentsController {
  constructor(private readonly marketCommentsService: MarketCommentsService) {}

  @Post()
  @ApiCreatedResponse({
    type: MarketComment,
  })
  create(@Body() createMarketCommentDto: CreateMarketCommentDto) {
    return this.marketCommentsService.create(createMarketCommentDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(MarketComment),
  })
  async findAll(
    @Query() query: FindAllMarketCommentsDto,
  ): Promise<InfinityPaginationResponseDto<MarketComment>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.marketCommentsService.findAllWithPagination({
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
    type: MarketComment,
  })
  findById(@Param('id') id: string) {
    return this.marketCommentsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: MarketComment,
  })
  update(
    @Param('id') id: string,
    @Body() updateMarketCommentDto: UpdateMarketCommentDto,
  ) {
    return this.marketCommentsService.update(id, updateMarketCommentDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.marketCommentsService.remove(id);
  }
}
