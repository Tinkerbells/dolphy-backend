import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { Deck } from './entities/deck.entity';
import { QueryDeckDto } from './dto/query-deck.dto';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiTags('Decks')
@Controller({
  path: 'decks',
  version: '1',
})
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: Deck })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDeckDto: CreateDeckDto, @Request() req): Promise<Deck> {
    return this.decksService.create(createDeckDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({ type: [Deck] })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: QueryDeckDto,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    return this.decksService.findAll(query);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: [Deck] })
  @HttpCode(HttpStatus.OK)
  findMyDecks(
    @Query() query: QueryDeckDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    return this.decksService.findMyDecks(query, req.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Deck })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<Deck> {
    return this.decksService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Deck })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
    @Request() req,
  ): Promise<Deck> {
    return this.decksService.update(id, updateDeckDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.decksService.remove(id, req.user.id);
  }
}
