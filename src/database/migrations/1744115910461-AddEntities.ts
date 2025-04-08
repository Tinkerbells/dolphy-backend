import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntities1744115910461 implements MigrationInterface {
  name = 'AddEntities1744115910461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "telegram_profile" ("telegramId" integer NOT NULL, "username" character varying, "firstName" character varying NOT NULL, "lastName" character varying, "photoUrl" character varying, "authDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "REL_195de6bab5ff1372c6c9e9ab65" UNIQUE ("userId"), CONSTRAINT "PK_cd600a48880a03ecfcdcd17bbf9" PRIMARY KEY ("telegramId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "front" text NOT NULL, "back" text NOT NULL, "hint" text, "intervalStep" integer NOT NULL DEFAULT '0', "nextReviewDate" TIMESTAMP, "correctStreak" integer NOT NULL DEFAULT '0', "incorrectStreak" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "deckId" uuid, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deck" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "isPublic" boolean NOT NULL DEFAULT false, "cardsCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerId" integer, CONSTRAINT "PK_99f8010303acab0edf8e1df24f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_statistic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isCorrect" boolean NOT NULL, "timeSpentMs" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "deckId" uuid, "cardId" uuid, CONSTRAINT "PK_44ea148d3b925ea1f81e5e5becd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "telegram_profile" ADD CONSTRAINT "FK_195de6bab5ff1372c6c9e9ab65f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_673081effbabe22d74757339c60" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deck" ADD CONSTRAINT "FK_2aec87a609b3ff62e18f364fced" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" ADD CONSTRAINT "FK_19dfa40c3365b543898b3bcc76e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" ADD CONSTRAINT "FK_06492d138b9fca76add4eb3b8a0" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" ADD CONSTRAINT "FK_3989c4bdbbc0acd333239bcc09c" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_3989c4bdbbc0acd333239bcc09c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_06492d138b9fca76add4eb3b8a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_19dfa40c3365b543898b3bcc76e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deck" DROP CONSTRAINT "FK_2aec87a609b3ff62e18f364fced"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_673081effbabe22d74757339c60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telegram_profile" DROP CONSTRAINT "FK_195de6bab5ff1372c6c9e9ab65f"`,
    );
    await queryRunner.query(`DROP TABLE "study_statistic"`);
    await queryRunner.query(`DROP TABLE "deck"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(`DROP TABLE "telegram_profile"`);
  }
}
