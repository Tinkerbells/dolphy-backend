import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecksRelationToCards1744958552548
  implements MigrationInterface
{
  name = 'AddDecksRelationToCards1744958552548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" ADD "deckId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_673081effbabe22d74757339c60" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_673081effbabe22d74757339c60"`,
    );
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "deckId"`);
  }
}
