import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRatingToRatingBreakdown1745256595352
  implements MigrationInterface
{
  name = 'ChangeRatingToRatingBreakdown1745256595352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market_deck" DROP COLUMN "isPublic"`);
    await queryRunner.query(
      `ALTER TABLE "market_deck" DROP COLUMN "isCopyAllowed"`,
    );
    await queryRunner.query(`ALTER TABLE "market_deck" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "market_deck" ADD "ratingBreakdown" json NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market_deck" DROP COLUMN "ratingBreakdown"`,
    );
    await queryRunner.query(
      `ALTER TABLE "market_deck" ADD "rating" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "market_deck" ADD "isCopyAllowed" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "market_deck" ADD "isPublic" boolean NOT NULL DEFAULT true`,
    );
  }
}
