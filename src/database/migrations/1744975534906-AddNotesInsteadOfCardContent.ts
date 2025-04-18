import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotesInsteadOfCardContent1744975534906
  implements MigrationInterface
{
  name = 'AddNotesInsteadOfCardContent1744975534906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardId" uuid NOT NULL, "question" character varying NOT NULL, "answer" character varying NOT NULL, "extend" json, "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_144a666d32424b08952c43fa7a" UNIQUE ("cardId"), CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" ADD CONSTRAINT "FK_144a666d32424b08952c43fa7a5" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_144a666d32424b08952c43fa7a5"`,
    );
    await queryRunner.query(`DROP TABLE "note"`);
  }
}
