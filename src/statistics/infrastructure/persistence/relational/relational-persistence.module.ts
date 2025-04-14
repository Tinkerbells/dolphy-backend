import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticEntity } from './entities/statistic.entity';
import { StatisticRepository } from '../statistic.repository';
import { StatisticRelationalRepository } from './repositories/statistic.repository';

/**
 * Модуль для работы с реляционным хранилищем статистики
 */
@Module({
  imports: [TypeOrmModule.forFeature([StatisticEntity])],
  providers: [
    {
      provide: StatisticRepository,
      useClass: StatisticRelationalRepository,
    },
  ],
  exports: [StatisticRepository],
})
export class RelationalStatisticPersistenceModule {}
