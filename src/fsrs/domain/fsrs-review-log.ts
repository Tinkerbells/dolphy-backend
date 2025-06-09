import { type ReviewLog } from 'ts-fsrs';

export class FsrsReviewLog {
  id: string;
  fsrsCardId: string;
  rating: number;
  review: Date;
  state: number;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  createdAt: Date;

  // Convert to ts-fsrs ReviewLog format
  toReviewLog(): ReviewLog {
    return {
      rating: this.rating,
      review: this.review,
      state: this.state,
      due: this.due,
      stability: this.stability,
      difficulty: this.difficulty,
      elapsed_days: this.elapsed_days,
      last_elapsed_days: this.last_elapsed_days,
      scheduled_days: this.scheduled_days,
    };
  }
}
