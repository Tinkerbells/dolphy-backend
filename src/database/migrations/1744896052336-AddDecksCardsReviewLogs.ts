import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecksCardsReviewLogs1744896052336
  implements MigrationInterface
{
  name = 'AddDecksCardsReviewLogs1744896052336';

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
      `CREATE TABLE "session" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "due" TIMESTAMP NOT NULL, "stability" real NOT NULL, "difficulty" real NOT NULL, "elapsed_days" integer NOT NULL, "scheduled_days" integer NOT NULL, "reps" integer NOT NULL, "lapses" integer NOT NULL, "state" character varying NOT NULL, "last_review" TIMESTAMP, "suspended" TIMESTAMP NOT NULL, "userId" character varying NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardId" uuid NOT NULL, "grade" character varying NOT NULL, "state" character varying NOT NULL, "due" TIMESTAMP NOT NULL, "stability" real NOT NULL, "difficulty" real NOT NULL, "elapsed_days" integer NOT NULL, "last_elapsed_days" integer NOT NULL, "scheduled_days" integer NOT NULL, "review" TIMESTAMP NOT NULL, "duration" integer NOT NULL DEFAULT '0', "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ecad2ce76fda34f800128a9370a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deck" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "deleted" boolean NOT NULL DEFAULT false, "userId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_99f8010303acab0edf8e1df24f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards_to_decks" ("cardId" uuid NOT NULL, "deckId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea8d932df77c6131b43a816f7ec" PRIMARY KEY ("cardId", "deckId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardId" uuid NOT NULL, "question" character varying NOT NULL, "answer" character varying NOT NULL, "source" character varying NOT NULL DEFAULT '', "sourceId" character varying, "extend" json, "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_4c4f93c2c57567d1072006683e" UNIQUE ("cardId"), CONSTRAINT "PK_c25f1226ad955fc288ee910e524" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_log" ADD CONSTRAINT "FK_1d8aad5c5c1d27fa058b3a63605" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards_to_decks" ADD CONSTRAINT "FK_d1108e3963d6a6fd961ec700798" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards_to_decks" ADD CONSTRAINT "FK_0f42ecc699200c36397e1256365" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_content" ADD CONSTRAINT "FK_4c4f93c2c57567d1072006683ef" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_content" DROP CONSTRAINT "FK_4c4f93c2c57567d1072006683ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards_to_decks" DROP CONSTRAINT "FK_0f42ecc699200c36397e1256365"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards_to_decks" DROP CONSTRAINT "FK_d1108e3963d6a6fd961ec700798"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_log" DROP CONSTRAINT "FK_1d8aad5c5c1d27fa058b3a63605"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
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
    await queryRunner.query(`DROP TABLE "card_content"`);
    await queryRunner.query(`DROP TABLE "cards_to_decks"`);
    await queryRunner.query(`DROP TABLE "deck"`);
    await queryRunner.query(`DROP TABLE "review_log"`);
    await queryRunner.query(`DROP TABLE "card"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
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
