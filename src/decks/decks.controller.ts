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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-decks.dto';
import { UpdateDeckDto } from './dto/update-decks.dto';
import { Deck } from './domain/deck';
import { FindAllDecksDto } from './dto/find-all-decks.dto';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { NullableType } from 'src/utils/types/nullable.type';

/**
 * Контроллер для управления колодами карточек
 */
@ApiTags('Decks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'decks',
  version: '1',
})
export class DecksController {
  /**
   * Конструктор
   * @param decksService Сервис колод
   */
  constructor(private readonly decksService: DecksService) {}

  /**
   * Создать новую колоду
   * @param req HTTP-запрос с данными пользователя
   * @param createDeckDto DTO с данными для создания
   */
  @Post()
  @ApiOperation({ summary: 'Создать новую колоду' })
  @ApiCreatedResponse({
    description: 'Колода успешно создана',
    type: Deck,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDeckDto: CreateDeckDto,
  ): Promise<Deck> {
    try {
      return await this.decksService.create(req.user.id, createDeckDto);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при создании колоды',
      );
    }
  }

  /**
   * Получить список колод с пагинацией
   * @param req HTTP-запрос с данными пользователя
   * @param query Параметры запроса
   */
  @Get()
  @ApiOperation({ summary: 'Получить список колод' })
  @ApiOkResponse({
    description: 'Список колод',
    type: InfinityPaginationResponse(Deck),
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Размер страницы',
  })
  @ApiQuery({
    name: 'deleted',
    required: false,
    type: Boolean,
    description: 'Включать удалённые',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Request() req,
    @Query() query: FindAllDecksDto,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const deleted = query?.deleted ?? false;

    try {
      const decks = await this.decksService.findAllWithPagination({
        uid: req.user.id,
        paginationOptions: {
          page,
          limit,
        },
        deleted,
      });

      // Получаем общее количество колод для пагинации
      // const allDecks = await this.decksService.findAll(req.user.id, deleted);

      return infinityPagination(decks, {
        page,
        limit,
      });
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при получении списка колод',
      );
    }
  }

  /**
   * Получить колоду по ID
   * @param req HTTP-запрос с данными пользователя
   * @param id ID колоды
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить колоду по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID колоды',
    required: true,
  })
  @ApiOkResponse({
    description: 'Колода',
    type: Deck,
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Request() req, @Param('id') id: number): Promise<Deck> {
    try {
      const deck = await this.decksService.findById(id, req.user.id);

      if (!deck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      return deck;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при получении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Обновить колоду
   * @param req HTTP-запрос с данными пользователя
   * @param id ID колоды
   * @param updateDeckDto DTO с данными для обновления
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить колоду' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID колоды',
    required: true,
  })
  @ApiOkResponse({
    description: 'Колода успешно обновлена',
    type: Deck,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateDeckDto: UpdateDeckDto,
  ): Promise<Deck> {
    try {
      const updatedDeck = await this.decksService.update(
        id,
        req.user.id,
        updateDeckDto,
      );

      if (!updatedDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      return updatedDeck;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при обновлении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Удалить колоду (мягкое удаление)
   * @param req HTTP-запрос с данными пользователя
   * @param id ID колоды
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить колоду (мягкое удаление)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID колоды',
    required: true,
  })
  @ApiNoContentResponse({ description: 'Колода успешно удалена' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    try {
      const success = await this.decksService.remove(id, req.user.id);

      if (!success) {
        throw new BadRequestException(`Не удалось удалить колоду с ID ${id}`);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при удалении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Восстановить удаленную колоду
   * @param req HTTP-запрос с данными пользователя
   * @param id ID колоды
   */
  @Post(':id/restore')
  @ApiOperation({ summary: 'Восстановить удаленную колоду' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID колоды',
    required: true,
  })
  @ApiOkResponse({
    description: 'Колода успешно восстановлена',
    type: Deck,
  })
  @HttpCode(HttpStatus.OK)
  async restore(@Request() req, @Param('id') id: number): Promise<Deck> {
    try {
      const restoredDeck = await this.decksService.restore(id, req.user.id);

      if (!restoredDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      return restoredDeck;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при восстановлении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Получить колоду по умолчанию
   * @param req HTTP-запрос с данными пользователя
   */
  @Get('default/deck')
  @ApiOperation({ summary: 'Получить колоду по умолчанию' })
  @ApiOkResponse({
    description: 'Колода по умолчанию',
    type: Deck,
  })
  @HttpCode(HttpStatus.OK)
  async getDefaultDeck(@Request() req): Promise<NullableType<Deck>> {
    try {
      const defaultDeckId = await this.decksService.getDefaultDeck(req.user.id);
      return await this.decksService.findById(defaultDeckId, req.user.id);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при получении колоды по умолчанию',
      );
    }
  }
}
