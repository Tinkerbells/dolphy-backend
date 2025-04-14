import { Module } from '@nestjs/common';
import { RevlogRelationalRepository } from './repositories/revlog.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevlogEntity } from './entities/revlog.entity';
import { RevlogRepository } from '../revlog.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RevlogEntity])],
  providers: [
    {
      provide: RevlogRepository,
      useClass: RevlogRelationalRepository,
    },
  ],
  exports: [RevlogRepository],
})
export class RelationalSchedulerPersistenceModule {}
