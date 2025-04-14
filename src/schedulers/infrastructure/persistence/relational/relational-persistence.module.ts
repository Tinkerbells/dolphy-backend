import { Module } from '@nestjs/common';
import { SchedulerRepository } from '../scheduler.repository';
import { SchedulerRelationalRepository } from './repositories/revlog.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerEntity } from './entities/revlog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchedulerEntity])],
  providers: [
    {
      provide: SchedulerRepository,
      useClass: SchedulerRelationalRepository,
    },
  ],
  exports: [SchedulerRepository],
})
export class RelationalSchedulerPersistenceModule {}
