import { Module } from '@nestjs/common';
import { DecksRepository } from '../decks.repository';
import { DecksRelationalRepository } from './repositories/decks.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksEntity } from './entities/decks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DecksEntity])],
  providers: [
    {
      provide: DecksRepository,
      useClass: DecksRelationalRepository,
    },
  ],
  exports: [DecksRepository],
})
export class RelationalDecksPersistenceModule {}
