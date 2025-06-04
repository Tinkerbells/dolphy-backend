import { Module } from '@nestjs/common';
import { FsrsRepository } from '../fsrs.repository';
import { FsrsRelationalRepository } from './repositories/fsrs.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsrsEntity } from './entities/fsrs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FsrsEntity])],
  providers: [
    {
      provide: FsrsRepository,
      useClass: FsrsRelationalRepository,
    },
  ],
  exports: [FsrsRepository],
})
export class RelationalFsrsPersistenceModule {}
