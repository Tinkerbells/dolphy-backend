import { Module } from '@nestjs/common';
import { FsrsService } from './fsrs.service';
import { FsrsController } from './fsrs.controller';
import { RelationalFsrsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalFsrsPersistenceModule],
  controllers: [FsrsController],
  providers: [FsrsService],
  exports: [FsrsService, RelationalFsrsPersistenceModule],
})
export class FsrsModule {}
