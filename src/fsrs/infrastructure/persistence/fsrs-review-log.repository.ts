import { FsrsReviewLog } from '../../domain/fsrs-review-log';

export abstract class FsrsReviewLogRepository {
  abstract create(data: FsrsReviewLog): Promise<FsrsReviewLog>;

  abstract findLastByFsrsCardId(
    fsrsCardId: string,
  ): Promise<FsrsReviewLog | null>;

  abstract findByFsrsCardId(fsrsCardId: string): Promise<FsrsReviewLog[]>;

  abstract remove(id: string): Promise<void>;

  abstract removeByFsrsCardId(fsrsCardId: string): Promise<void>;
}
