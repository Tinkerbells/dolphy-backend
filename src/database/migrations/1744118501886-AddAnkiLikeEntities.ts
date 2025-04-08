import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnkiLikeEntities1744118501886 implements MigrationInterface {
  name = 'AddAnkiLikeEntities1744118501886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."study_session_card_status_enum" AS ENUM('new', 'learning', 'review', 'relearning')`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_session_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."study_session_card_status_enum" NOT NULL DEFAULT 'new', "interval" integer NOT NULL DEFAULT '0', "easeFactor" integer NOT NULL DEFAULT '0', "consecutiveCorrect" integer NOT NULL DEFAULT '0', "dueDate" TIMESTAMP, "isCompleted" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "lastReviewedAt" TIMESTAMP, "lastAnswer" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionId" uuid, "cardId" uuid, CONSTRAINT "PK_a47b82363b7cfff2393678f33f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "study_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalCards" integer NOT NULL DEFAULT '0', "cardsCompleted" integer NOT NULL DEFAULT '0', "cardsCorrect" integer NOT NULL DEFAULT '0', "isCompleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "deckId" uuid, CONSTRAINT "PK_d09225f8e9d2b6682e3b13c46e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_cc04f13158945b48709803f223a" FOREIGN KEY ("sessionId") REFERENCES "study_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" ADD CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_7c6cc9077553bf81d77ac1259f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" ADD CONSTRAINT "FK_e33cce75a98732cb8b840273596" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_e33cce75a98732cb8b840273596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session" DROP CONSTRAINT "FK_7c6cc9077553bf81d77ac1259f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_63cbe553ff9acf6c15fe6619829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_session_card" DROP CONSTRAINT "FK_cc04f13158945b48709803f223a"`,
    );
    await queryRunner.query(`DROP TABLE "study_session"`);
    await queryRunner.query(`DROP TABLE "study_session_card"`);
    await queryRunner.query(
      `DROP TYPE "public"."study_session_card_status_enum"`,
    );
  }
}
