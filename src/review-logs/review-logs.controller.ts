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
import { ReviewLogsService } from './review-logs.service';
import { CreateReviewLogDto } from './dto/create-review-log.dto';
import { UpdateReviewLogDto } from './dto/update-review-log.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewLog } from './domain/review-log';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllReviewLogsDto } from './dto/find-all-review-logs.dto';

@ApiTags('ReviewLogs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'review-logs',
  version: '1',
})
export class ReviewLogsController {
  constructor(private readonly reviewLogsService: ReviewLogsService) {}

  @Post()
  @ApiCreatedResponse({
    type: ReviewLog,
  })
  create(@Body() createReviewLogDto: CreateReviewLogDto) {
    return this.reviewLogsService.create(createReviewLogDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(ReviewLog),
  })
  async findAll(
    @Query() query: FindAllReviewLogsDto,
  ): Promise<InfinityPaginationResponseDto<ReviewLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const reviewLogs = await this.reviewLogsService.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      cardId: query.cardId,
    });

    return infinityPagination(reviewLogs, { page, limit });
  }

  @Get('card/:cardId')
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: [ReviewLog],
  })
  findByCardId(@Param('cardId') cardId: string) {
    return this.reviewLogsService.findByCardId(cardId);
  }

  @Get('card/:cardId/stats')
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
  })
  getCardStats(@Param('cardId') cardId: string) {
    return this.reviewLogsService.getCardStats(cardId);
  }

  @Get('card/:cardId/latest')
  @ApiParam({
    name: 'cardId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: ReviewLog,
  })
  findLatestByCardId(@Param('cardId') cardId: string) {
    return this.reviewLogsService.findLatestByCardId(cardId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: ReviewLog,
  })
  findOne(@Param('id') id: string) {
    return this.reviewLogsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: ReviewLog,
  })
  update(
    @Param('id') id: string,
    @Body() updateReviewLogDto: UpdateReviewLogDto,
  ) {
    return this.reviewLogsService.update(id, updateReviewLogDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.reviewLogsService.softDelete(id);
  }
}
