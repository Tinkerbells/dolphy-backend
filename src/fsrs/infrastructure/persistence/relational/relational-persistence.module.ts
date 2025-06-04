import { Module } from '@nestjs/common';
import { FsrsCardRepository } from '../fsrs-card.repository';
import { FsrsCardRelationalRepository } from './repositories/fsrs-card.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsrsCardEntity } from './entities/fsrs-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FsrsCardEntity])],
  providers: [
    {
      provide: FsrsCardRepository,
      useClass: FsrsCardRelationalRepository,
    },
  ],
  exports: [FsrsCardRepository],
})
export class RelationalFsrsPersistenceModule {}
