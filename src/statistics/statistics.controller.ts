import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { StudyStatistic } from './entities/study-statistic.entity';
import { QueryStatisticDto } from './dto/query-statistic.dto';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { Request as ExpressRequest } from 'express';
import { DeckStatisticsSummary, StatisticsSummary } from './statistics.service';

// Interface for the extended Express.Request with user property
interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    [key: string]: any;
  };
}

@ApiTags('Statistics')
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: StudyStatistic })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createStatisticDto: CreateStatisticDto,
    @Request() req: RequestWithUser,
  ): Promise<StudyStatistic> {
    return this.statisticsService.create(createStatisticDto, req.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: [StudyStatistic] })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: QueryStatisticDto,
    @Request() req: RequestWithUser,
  ): Promise<InfinityPaginationResponseDto<StudyStatistic>> {
    return this.statisticsService.findAll(query, req.user.id);
  }

  @Get('summary')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getSummary(@Request() req: RequestWithUser): Promise<StatisticsSummary> {
    return this.statisticsService.getSummary(req.user.id);
  }

  @Get('deck-summary')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getDeckSummary(
    @Query('deckId') deckId: string,
    @Request() req: RequestWithUser,
  ): Promise<DeckStatisticsSummary> {
    return this.statisticsService.getDeckSummary(deckId, req.user.id);
  }
}
