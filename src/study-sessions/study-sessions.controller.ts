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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';
import { AnswerCardDto } from './dto/answer-card.dto';
import { NextCardResponseDto } from './dto/next-card-response.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { StudySession } from './domain/study-session';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllStudySessionsDto } from './dto/find-all-study-sessions.dto';

@ApiTags('Study Sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'study-sessions',
  version: '1',
})
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую сессию обучения' })
  @ApiCreatedResponse({
    type: StudySession,
    description: 'Новая сессия обучения успешно создана',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStudySessionDto: CreateStudySessionDto) {
    return this.studySessionsService.createStudySession(createStudySessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список сессий обучения с пагинацией' })
  @ApiOkResponse({
    type: InfinityPaginationResponse(StudySession),
    description: 'Список сессий обучения успешно получен',
  })
  async findAll(
    @Query() query: FindAllStudySessionsDto,
  ): Promise<InfinityPaginationResponseDto<StudySession>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.studySessionsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сессию обучения по ID' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID сессии обучения',
  })
  @ApiOkResponse({
    type: StudySession,
    description: 'Сессия обучения успешно получена',
  })
  findById(@Param('id') id: string) {
    return this.studySessionsService.findById(id);
  }

  @Get(':id/next-card')
  @ApiOperation({ summary: 'Получить следующую карточку для изучения' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID сессии обучения',
  })
  @ApiOkResponse({
    type: NextCardResponseDto,
    description: 'Следующая карточка успешно получена',
  })
  getNextCard(@Param('id') id: string): Promise<NextCardResponseDto> {
    return this.studySessionsService.getNextCard(id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Отправить ответ на карточку' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID сессии обучения',
  })
  @ApiOkResponse({
    type: NextCardResponseDto,
    description: 'Ответ на карточку принят, следующая карточка возвращена',
  })
  @HttpCode(HttpStatus.OK)
  answerCard(
    @Param('id') id: string,
    @Body() answerCardDto: AnswerCardDto,
  ): Promise<NextCardResponseDto> {
    return this.studySessionsService.answerCard(id, answerCardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить сессию обучения' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID сессии обучения',
  })
  @ApiOkResponse({
    type: StudySession,
    description: 'Сессия обучения успешно обновлена',
  })
  update(
    @Param('id') id: string,
    @Body() updateStudySessionDto: UpdateStudySessionDto,
  ) {
    return this.studySessionsService.update(id, updateStudySessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить сессию обучения' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'ID сессии обучения',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.studySessionsService.remove(id);
  }
}
