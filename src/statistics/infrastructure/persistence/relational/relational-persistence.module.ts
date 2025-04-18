import { Module } from '@nestjs/common';
import { StatisticRepository } from '../statistic.repository';
import { StatisticRelationalRepository } from './repositories/statistic.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticEntity } from './entities/statistic.entity';

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
