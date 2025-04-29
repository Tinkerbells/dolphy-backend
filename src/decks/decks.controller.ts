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
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Deck } from './domain/deck';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllDecksDto } from './dto/find-all-decks.dto';
import { OperationResultDto } from '../utils/dto/operation-result.dto';

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
    type: Deck,
  })
  create(@Body() createDeckDto: CreateDeckDto, @Request() req) {
    return this.decksService.create(createDeckDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Deck),
  })
  async findAll(
    @Query() query: FindAllDecksDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    // Получаем колоды текущего пользователя
    const userId = req.user.id;
    const decks = await this.decksService.findByUserId(userId);

    return infinityPagination(decks, { page, limit });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Deck,
  })
  findOne(@Param('id') id: string) {
    return this.decksService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Deck,
  })
  update(@Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto) {
    return this.decksService.update(id, updateDeckDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: OperationResultDto,
    description: 'Deck successfully deleted',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.decksService.softDelete(id);
  }
}
