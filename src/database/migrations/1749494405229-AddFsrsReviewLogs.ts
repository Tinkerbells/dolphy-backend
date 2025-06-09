import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFsrsReviewLogs1749494405229 implements MigrationInterface {
  name = 'AddFsrsReviewLogs1749494405229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fsrs_review_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fsrsCardId" uuid NOT NULL, "rating" integer NOT NULL, "review" TIMESTAMP NOT NULL, "state" integer NOT NULL, "due" TIMESTAMP NOT NULL, "stability" real NOT NULL, "difficulty" real NOT NULL, "elapsed_days" integer NOT NULL, "scheduled_days" integer NOT NULL, "reps" integer NOT NULL, "lapses" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_412ed5aeef7bb8d3ea667405cad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FSRS_REVIEW_LOG_CARD_ID" ON "fsrs_review_log" ("fsrsCardId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfd5c4423087dfa2d640c87a13" ON "fsrs_review_log" ("fsrsCardId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_card" DROP COLUMN "previous_state"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a09b6ca9e0e1c63e610faa91c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_card" ALTER COLUMN "state" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a09b6ca9e0e1c63e610faa91c1" ON "fsrs_card" ("state", "deleted") `,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" ADD CONSTRAINT "FK_927bf62c43c5a018610b3ecf6e3" FOREIGN KEY ("fsrsCardId") REFERENCES "fsrs_card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fsrs_review_log" DROP CONSTRAINT "FK_927bf62c43c5a018610b3ecf6e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a09b6ca9e0e1c63e610faa91c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_card" ALTER COLUMN "state" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a09b6ca9e0e1c63e610faa91c1" ON "fsrs_card" ("deleted", "state") `,
    );
    await queryRunner.query(
      `ALTER TABLE "fsrs_card" ADD "previous_state" text`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfd5c4423087dfa2d640c87a13"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_FSRS_REVIEW_LOG_CARD_ID"`,
    );
    await queryRunner.query(`DROP TABLE "fsrs_review_log"`);
  }
}
