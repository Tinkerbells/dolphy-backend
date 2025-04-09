import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecksAndCards1744228041877 implements MigrationInterface {
  name = 'AddDecksAndCards1744228041877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(
      `CREATE TABLE "decks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "isPublic" boolean NOT NULL DEFAULT false, "cardsCount" integer NOT NULL DEFAULT '0', "ownerId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_981894e3f8dbe5049ac59cb1af1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "front" text NOT NULL, "back" text NOT NULL, "hint" text, "intervalStep" integer NOT NULL DEFAULT '0', "nextReviewDate" TIMESTAMP, "correctStreak" integer NOT NULL DEFAULT '0', "incorrectStreak" integer NOT NULL DEFAULT '0', "deckId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "decks" ADD CONSTRAINT "FK_256aeb63e4cc0a8576258f083b0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "FK_e74ee86acf2e667e38582f0a45c" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" DROP CONSTRAINT "FK_e74ee86acf2e667e38582f0a45c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decks" DROP CONSTRAINT "FK_256aeb63e4cc0a8576258f083b0"`,
    );
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "decks"`);
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
