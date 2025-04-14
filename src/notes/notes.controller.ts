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
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './domain/note';
import { FindAllNotesDto } from './dto/find-all-notes.dto';
import { DecksService } from '../decks/decks.service';

/**
 * Контроллер для управления заметками
 */
@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notes',
  version: '1',
})
export class NotesController {
  /**
   * Конструктор
   * @param notesService Сервис заметок
   * @param decksService Сервис колод
   */
  constructor(
    private readonly notesService: NotesService,
    private readonly decksService: DecksService,
  ) {}

  /**
   * Создать новую заметку
   * @param req HTTP-запрос с данными пользователя
   * @param createNoteDto DTO с данными для создания
   */
  @Post()
  @ApiOperation({ summary: 'Создать новую заметку' })
  @ApiCreatedResponse({
    description: 'Заметка успешно создана',
    type: Note,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<{ id: number }> {
    try {
      // Если колода не указана, используем колоду по умолчанию
      let deckId = createNoteDto.deckId;

      if (!deckId) {
        deckId = await this.decksService.getDefaultDeck(req.user.id);
      } else {
        // Проверяем доступ к колоде
        const deck = await this.decksService.findById(deckId, req.user.id);
        if (!deck) {
          throw new NotFoundException(
            `Колода с ID ${deckId} не найдена или недоступна`,
          );
        }
      }

      // Создаем заметку
      const noteId = await this.notesService.create(
        req.user.id,
        deckId,
        createNoteDto,
      );

      return { id: noteId };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Ошибка при создании заметки',
      );
    }
  }

  /**
   * Получить список заметок с фильтрацией и пагинацией
   * @param req HTTP-запрос с данными пользователя
   * @param query Параметры запроса
   */
  @Get()
  @ApiOperation({ summary: 'Получить список заметок' })
  @ApiOkResponse({
    description: 'Список заметок',
    type: [Note],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Размер страницы',
  })
  @ApiQuery({
    name: 'deckId',
    required: false,
    type: Number,
    description: 'ID колоды',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: 'Ключевое слово для поиска',
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
    @Query() query: FindAllNotesDto,
  ): Promise<{
    data: Note[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }> {
    const { page = 1, pageSize = 10, deckId, keyword, deleted } = query;

    try {
      // Если указана колода, проверяем доступ к ней
      if (deckId) {
        const deck = await this.decksService.findById(deckId, req.user.id);
        if (!deck) {
          throw new NotFoundException(
            `Колода с ID ${deckId} не найдена или недоступна`,
          );
        }
      }

      // Получаем заметки
      return this.notesService.findAll(req.user.id, {
        did: deckId,
        keyword,
        deleted,
        page,
        pageSize,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Ошибка при получении списка заметок',
      );
    }
  }

  /**
   * Получить заметку по ID
   * @param req HTTP-запрос с данными пользователя
   * @param id ID заметки
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить заметку по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заметки' })
  @ApiOkResponse({
    description: 'Заметка',
    type: Note,
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Request() req, @Param('id') id: number): Promise<Note> {
    try {
      const note = await this.notesService.findById(id, req.user.id);

      if (!note) {
        throw new NotFoundException(
          `Заметка с ID ${id} не найдена или недоступна`,
        );
      }

      return note;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || `Ошибка при получении заметки с ID ${id}`,
      );
    }
  }

  /**
   * Обновить заметку
   * @param req HTTP-запрос с данными пользователя
   * @param id ID заметки
   * @param updateNoteDto DTO с данными для обновления
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заметку' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заметки' })
  @ApiOkResponse({
    description: 'Заметка успешно обновлена',
    type: Boolean,
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<{ success: boolean }> {
    try {
      // Проверяем существование заметки и доступ к ней
      const note = await this.notesService.findById(id, req.user.id);

      if (!note) {
        throw new NotFoundException(
          `Заметка с ID ${id} не найдена или недоступна`,
        );
      }

      // Обновляем заметку
      const success = await this.notesService.update(
        id,
        req.user.id,
        updateNoteDto,
      );

      return { success };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || `Ошибка при обновлении заметки с ID ${id}`,
      );
    }
  }

  /**
   * Удалить заметку (мягкое удаление)
   * @param req HTTP-запрос с данными пользователя
   * @param id ID заметки
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заметку (мягкое удаление)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заметки' })
  @ApiNoContentResponse({ description: 'Заметка успешно удалена' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    try {
      // Проверяем существование заметки и доступ к ней
      const note = await this.notesService.findById(id, req.user.id);

      if (!note) {
        throw new NotFoundException(
          `Заметка с ID ${id} не найдена или недоступна`,
        );
      }

      // Удаляем заметку (мягкое удаление)
      await this.notesService.switchDelete([id], true, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || `Ошибка при удалении заметки с ID ${id}`,
      );
    }
  }

  /**
   * Восстановить удаленную заметку
   * @param req HTTP-запрос с данными пользователя
   * @param id ID заметки
   */
  @Post(':id/restore')
  @ApiOperation({ summary: 'Восстановить удаленную заметку' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заметки' })
  @ApiOkResponse({ description: 'Заметка успешно восстановлена' })
  @HttpCode(HttpStatus.OK)
  async restore(
    @Request() req,
    @Param('id') id: number,
  ): Promise<{ success: boolean }> {
    try {
      // Проверяем существование заметки и доступ к ней (включая удаленные)
      const note = await this.notesService.findById(id, req.user.id);

      if (!note) {
        throw new NotFoundException(
          `Заметка с ID ${id} не найдена или недоступна`,
        );
      }

      if (!note.deleted) {
        return { success: true }; // Заметка уже восстановлена
      }

      // Восстанавливаем заметку
      await this.notesService.switchDelete([id], false, req.user.id);

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || `Ошибка при восстановлении заметки с ID ${id}`,
      );
    }
  }

  /**
   * Пакетное удаление заметок
   * @param req HTTP-запрос с данными пользователя
   * @param ids Массив ID заметок
   */
  @Delete('batch')
  @ApiOperation({ summary: 'Пакетное удаление заметок' })
  @ApiOkResponse({ description: 'Заметки успешно удалены' })
  @HttpCode(HttpStatus.OK)
  async batchDelete(
    @Request() req,
    @Body('ids') ids: number[],
  ): Promise<{ success: boolean }> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Необходимо указать массив ID заметок');
    }

    try {
      // Удаляем заметки (мягкое удаление)
      await this.notesService.switchDelete(ids, true, req.user.id);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при пакетном удалении заметок',
      );
    }
  }

  /**
   * Пакетное восстановление заметок
   * @param req HTTP-запрос с данными пользователя
   * @param ids Массив ID заметок
   */
  @Post('batch/restore')
  @ApiOperation({ summary: 'Пакетное восстановление заметок' })
  @ApiOkResponse({ description: 'Заметки успешно восстановлены' })
  @HttpCode(HttpStatus.OK)
  async batchRestore(
    @Request() req,
    @Body('ids') ids: number[],
  ): Promise<{ success: boolean }> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Необходимо указать массив ID заметок');
    }

    try {
      // Восстанавливаем заметки
      await this.notesService.switchDelete(ids, false, req.user.id);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при пакетном восстановлении заметок',
      );
    }
  }
}
