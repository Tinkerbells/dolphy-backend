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
import { StudySessionsService } from './study-sessions.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { StudySession } from './domain/study-session';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllStudySessionsDto } from './dto/find-all-study-sessions.dto';

@ApiTags('Studysessions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'study-sessions',
  version: '1',
})
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  @ApiCreatedResponse({
    type: StudySession,
  })
  create(@Body() createStudySessionDto: CreateStudySessionDto) {
    return this.studySessionsService.create(createStudySessionDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(StudySession),
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
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: StudySession,
  })
  findById(@Param('id') id: string) {
    return this.studySessionsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: StudySession,
  })
  update(
    @Param('id') id: string,
    @Body() updateStudySessionDto: UpdateStudySessionDto,
  ) {
    return this.studySessionsService.update(id, updateStudySessionDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.studySessionsService.remove(id);
  }
}
