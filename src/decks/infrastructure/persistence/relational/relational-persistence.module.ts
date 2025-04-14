import { Module } from '@nestjs/common';
import { DecksRepository } from '../deck.repository';
import { DecksRelationalRepository } from './repositories/deck.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksEntity } from './entities/deck.entity';

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
