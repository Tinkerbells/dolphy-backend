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
import { FsrsService } from './fsrs.service';
import { CreateFsrsDto } from './dto/create-fsrs.dto';
import { UpdateFsrsDto } from './dto/update-fsrs.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Fsrs } from './domain/fsrs';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllFsrsDto } from './dto/find-all-fsrs.dto';

@ApiTags('Fsrs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'fsrs',
  version: '1',
})
export class FsrsController {
  constructor(private readonly fsrsService: FsrsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Fsrs,
  })
  create(@Body() createFsrsDto: CreateFsrsDto) {
    return this.fsrsService.create(createFsrsDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Fsrs),
  })
  async findAll(
    @Query() query: FindAllFsrsDto,
  ): Promise<InfinityPaginationResponseDto<Fsrs>> {
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
    type: Fsrs,
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
    type: Fsrs,
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
