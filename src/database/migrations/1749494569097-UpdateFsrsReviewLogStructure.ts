import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFsrsReviewLogStructure1749494569097
  implements MigrationInterface
{
  name = 'UpdateFsrsReviewLogStructure1749494569097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fsrs_review_log" DROP COLUMN "reps"`);
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" DROP COLUMN "lapses"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" ADD "last_elapsed_days" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" DROP COLUMN "last_elapsed_days"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" ADD "lapses" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" ADD "reps" integer NOT NULL`,
    );
  }
}
