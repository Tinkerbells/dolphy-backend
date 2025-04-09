import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudySession1744224897089 implements MigrationInterface {
  name = 'AddStudySession1744224897089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `CREATE TABLE "decks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_981894e3f8dbe5049ac59cb1af1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "decks"`);
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
