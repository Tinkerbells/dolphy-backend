import {
  // common
  Module,
} from '@nestjs/common';
import { SchedulersService } from './schedulers.service';
import { SchedulersController } from './schedulers.controller';
import { RelationalSchedulerPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalSchedulerPersistenceModule],
  controllers: [SchedulersController],
  providers: [SchedulersService],
  exports: [SchedulersService, RelationalSchedulerPersistenceModule],
})
export class SchedulersModule {}
