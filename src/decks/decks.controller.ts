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
import { DecksService } from './decks.service';
import { CreateDecksDto } from './dto/create-decks.dto';
import { UpdateDecksDto } from './dto/update-decks.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Decks } from './domain/decks';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllDecksDto } from './dto/find-all-decks.dto';

@ApiTags('Decks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'decks',
  version: '1',
})
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  @ApiCreatedResponse({
    type: Decks,
  })
  create(@Body() createDecksDto: CreateDecksDto) {
    return this.decksService.create(createDecksDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Decks),
  })
  async findAll(
    @Query() query: FindAllDecksDto,
  ): Promise<InfinityPaginationResponseDto<Decks>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.decksService.findAllWithPagination({
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
    type: Decks,
  })
  findById(@Param('id') id: string) {
    return this.decksService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Decks,
  })
  update(@Param('id') id: string, @Body() updateDecksDto: UpdateDecksDto) {
    return this.decksService.update(id, updateDecksDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.decksService.remove(id);
  }
}
