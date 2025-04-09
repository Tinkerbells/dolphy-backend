import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntities1744228359643 implements MigrationInterface {
  name = 'AddEntities1744228359643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "status" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying, "password" character varying, "provider" character varying NOT NULL DEFAULT 'email', "socialId" character varying, "firstName" character varying, "lastName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "photoId" uuid, "roleId" integer, "statusId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_75e2be4ce11d447ef43be0e374" UNIQUE ("photoId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bd2fe7a8e694dedc4ec2f666f" ON "user" ("socialId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58e4dbff0e1a32a9bdc861bb29" ON "user" ("firstName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0e1b4ecdca13b177e2e3a0613" ON "user" ("lastName") `,
    );
    await queryRunner.query(
      `CREATE TABLE "telegram_profile" ("telegramId" integer NOT NULL, "username" character varying, "firstName" character varying NOT NULL, "lastName" character varying, "photoUrl" character varying, "authDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "REL_195de6bab5ff1372c6c9e9ab65" UNIQUE ("userId"), CONSTRAINT "PK_cd600a48880a03ecfcdcd17bbf9" PRIMARY KEY ("telegramId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "decks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "isPublic" boolean NOT NULL DEFAULT false, "cardsCount" integer NOT NULL DEFAULT '0', "ownerId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_981894e3f8dbe5049ac59cb1af1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalCards" integer NOT NULL DEFAULT '0', "cardsCompleted" integer NOT NULL DEFAULT '0', "cardsCorrect" integer NOT NULL DEFAULT '0', "isCompleted" boolean NOT NULL DEFAULT false, "userId" integer, "deckId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d09225f8e9d2b6682e3b13c46e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "front" text NOT NULL, "back" text NOT NULL, "hint" text, "intervalStep" integer NOT NULL DEFAULT '0', "nextReviewDate" TIMESTAMP, "correctStreak" integer NOT NULL DEFAULT '0', "incorrectStreak" integer NOT NULL DEFAULT '0', "deckId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."study_session_card_status_enum" AS ENUM('new', 'learning', 'review', 'relearning')`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_session_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."study_session_card_status_enum" NOT NULL DEFAULT 'new', "interval" integer NOT NULL DEFAULT '0', "easeFactor" integer NOT NULL DEFAULT '0', "consecutiveCorrect" integer NOT NULL DEFAULT '0', "dueDate" TIMESTAMP, "isCompleted" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "lastReviewedAt" TIMESTAMP, "lastAnswer" integer, "sessionId" uuid, "cardId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a47b82363b7cfff2393678f33f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_dc18daa696860586ba4667a9d31" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "telegram_profile" ADD CONSTRAINT "FK_195de6bab5ff1372c6c9e9ab65f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "decks" ADD CONSTRAINT "FK_256aeb63e4cc0a8576258f083b0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_7c6cc9077553bf81d77ac1259f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "FK_e74ee86acf2e667e38582f0a45c" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_cc04f13158945b48709803f223a" FOREIGN KEY ("sessionId") REFERENCES "study_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_cc04f13158945b48709803f223a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" DROP CONSTRAINT "FK_e74ee86acf2e667e38582f0a45c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_7c6cc9077553bf81d77ac1259f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decks" DROP CONSTRAINT "FK_256aeb63e4cc0a8576258f083b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telegram_profile" DROP CONSTRAINT "FK_195de6bab5ff1372c6c9e9ab65f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696860586ba4667a9d31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "study_session_card"`);
    await queryRunner.query(
      `DROP TYPE "public"."study_session_card_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "study_session"`);
    await queryRunner.query(`DROP TABLE "decks"`);
    await queryRunner.query(`DROP TABLE "telegram_profile"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0e1b4ecdca13b177e2e3a0613"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58e4dbff0e1a32a9bdc861bb29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bd2fe7a8e694dedc4ec2f666f"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "status"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
