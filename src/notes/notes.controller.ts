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
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Note } from './domain/note';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllNotesDto } from './dto/find-all-notes.dto';
import { FindNotesByDeckDto } from './dto/find-notes-by-deck.dto';
import { t } from '../utils/i18n';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notes',
  version: '1',
})
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую заметку' })
  @ApiCreatedResponse({
    type: Note,
    description: 'Заметка успешно создана',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех заметок с пагинацией' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(Note),
    description: 'Список заметок с пагинацией',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindAllNotesDto,
  ): Promise<InfinityPaginationResponseDto<Note>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.notesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get('deck/:deckId')
  @ApiOperation({ summary: 'Получить заметки по ID колоды с пагинацией' })
  @ApiParam({
    name: 'deckId',
    type: String,
    required: true,
    description: 'Уникальный идентификатор колоды',
  })
  @ApiOkResponse({
    type: InfinityPaginationResponse(Note),
    description: 'Список заметок для указанной колоды с пагинацией',
  })
  @HttpCode(HttpStatus.OK)
  async findByDeckId(
    @Param('deckId') deckId: string,
    @Query() query: FindNotesByDeckDto,
  ): Promise<InfinityPaginationResponseDto<Note>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const notes = await this.notesService.findByDeckIdWithPagination({
      deckId,
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPagination(notes, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заметку по ID' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор заметки',
  })
  @ApiOkResponse({
    type: Note,
    description: 'Заметка найдена',
  })
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: string) {
    return this.notesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заметку' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор заметки',
  })
  @ApiOkResponse({
    type: Note,
    description: 'Заметка успешно обновлена',
  })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    const updatedNote = await this.notesService.update(id, updateNoteDto);
    if (!updatedNote) {
      throw new BadRequestException(t('notes.notFound'));
    }
    return updatedNote;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заметку' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Уникальный идентификатор заметки',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
