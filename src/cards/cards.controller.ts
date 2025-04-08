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
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AnswerCardDto } from './dto/answer-card.dto';
import { Card } from './entities/card.entity';

@ApiTags('Cards')
@Controller({
  path: 'cards',
  version: '1',
})
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: Card })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCardDto: CreateCardDto, @Request() req): Promise<Card> {
    return this.cardsService.create(createCardDto, req.user.id);
  }

  @Get('deck/:deckId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: [Card] })
  @HttpCode(HttpStatus.OK)
  findByDeck(@Param('deckId') deckId: string): Promise<Card[]> {
    return this.cardsService.findByDeck(deckId);
  }

  @Get('study/:deckId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: [Card] })
  @HttpCode(HttpStatus.OK)
  getCardsForStudy(
    @Param('deckId') deckId: string,
    @Request() req,
  ): Promise<Card[]> {
    return this.cardsService.getCardsForStudy(deckId, req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Card })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Card })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Request() req,
  ): Promise<Card> {
    return this.cardsService.update(id, updateCardDto, req.user.id);
  }

  @Post(':id/answer')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Card })
  @HttpCode(HttpStatus.OK)
  answerCard(
    @Param('id') id: string,
    @Body() answerCardDto: AnswerCardDto,
    @Request() req,
  ): Promise<Card> {
    return this.cardsService.answerCard(
      id,
      answerCardDto.isCorrect,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.cardsService.remove(id, req.user.id);
  }
}
