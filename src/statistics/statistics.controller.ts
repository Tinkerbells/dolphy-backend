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
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Statistic } from './domain/statistic';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllStatisticsDto } from './dto/find-all-statistics.dto';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Statistic,
  })
  create(@Body() createStatisticDto: CreateStatisticDto) {
    return this.statisticsService.create(createStatisticDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Statistic),
  })
  async findAll(
    @Query() query: FindAllStatisticsDto,
  ): Promise<InfinityPaginationResponseDto<Statistic>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.statisticsService.findAllWithPagination({
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
    type: Statistic,
  })
  findById(@Param('id') id: string) {
    return this.statisticsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Statistic,
  })
  update(
    @Param('id') id: string,
    @Body() updateStatisticDto: UpdateStatisticDto,
  ) {
    return this.statisticsService.update(id, updateStatisticDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.statisticsService.remove(id);
  }
}
