import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlashcardsEntities1680000000000
  implements MigrationInterface
{
  name = 'CreateFlashcardsEntities1680000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу telegram_profile
    await queryRunner.query(`
      CREATE TABLE "telegram_profile" (
        "telegramId" integer NOT NULL,
        "username" character varying,
        "firstName" character varying NOT NULL,
        "lastName" character varying,
        "photoUrl" character varying,
        "authDate" TIMESTAMP NOT NULL,
        "userId" integer,
        CONSTRAINT "REL_8a5ab7b7782673fca7773830ec" UNIQUE ("userId"),
        CONSTRAINT "PK_b7e5e060eeaafb23b4e9cf4cad2" PRIMARY KEY ("telegramId")
      )
    `);

    // Создаем таблицу deck
    await queryRunner.query(`
      CREATE TABLE "deck" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "isPublic" boolean NOT NULL DEFAULT false,
        "cardsCount" integer NOT NULL DEFAULT 0,
        "ownerId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_99f8010303acab0edc12d3904d4" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу card
    await queryRunner.query(`
      CREATE TABLE "card" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "front" text NOT NULL,
        "back" text NOT NULL,
        "hint" text,
        "intervalStep" integer NOT NULL DEFAULT 0,
        "nextReviewDate" TIMESTAMP,
        "correctStreak" integer NOT NULL DEFAULT 0,
        "incorrectStreak" integer NOT NULL DEFAULT 0,
        "deckId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id")
      )
    `);

    // Создаем таблицу study_statistic
    await queryRunner.query(`
      CREATE TABLE "study_statistic" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isCorrect" boolean NOT NULL,
        "timeSpentMs" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer,
        "deckId" uuid,
        "cardId" uuid,
        CONSTRAINT "PK_c68b8f3f4f0d83173be117e8aea" PRIMARY KEY ("id")
      )
    `);

    // Создаем внешние ключи
    await queryRunner.query(`
      ALTER TABLE "telegram_profile" 
      ADD CONSTRAINT "FK_8a5ab7b7782673fca7773830ec8" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "deck" 
      ADD CONSTRAINT "FK_302c6a07e553d8184a3154371ea" 
      FOREIGN KEY ("ownerId") REFERENCES "user"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "card" 
      ADD CONSTRAINT "FK_673081effbf63b7b1985343559b" 
      FOREIGN KEY ("deckId") REFERENCES "deck"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "study_statistic" 
      ADD CONSTRAINT "FK_80b37ce3e849c4227646994d5e2" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "study_statistic" 
      ADD CONSTRAINT "FK_3c4df5bb4c0e4c2e4c6d2951fe0" 
      FOREIGN KEY ("deckId") REFERENCES "deck"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "study_statistic" 
      ADD CONSTRAINT "FK_a7f636b4c4b71fbc5f72c3945cf" 
      FOREIGN KEY ("cardId") REFERENCES "card"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_a7f636b4c4b71fbc5f72c3945cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_3c4df5bb4c0e4c2e4c6d2951fe0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_statistic" DROP CONSTRAINT "FK_80b37ce3e849c4227646994d5e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_673081effbf63b7b1985343559b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deck" DROP CONSTRAINT "FK_302c6a07e553d8184a3154371ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telegram_profile" DROP CONSTRAINT "FK_8a5ab7b7782673fca7773830ec8"`,
    );

    // Удаляем таблицы
    await queryRunner.query(`DROP TABLE "study_statistic"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(`DROP TABLE "deck"`);
    await queryRunner.query(`DROP TABLE "telegram_profile"`);
  }
}
