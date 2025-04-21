import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketEntities1745240540286 implements MigrationInterface {
  name = 'AddMarketEntities1745240540286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "market_deck" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deckId" character varying NOT NULL, "authorId" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "tags" text, "isPublic" boolean NOT NULL DEFAULT true, "isCopyAllowed" boolean NOT NULL DEFAULT true, "downloadCount" integer NOT NULL DEFAULT '0', "rating" double precision NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "cardsCount" integer NOT NULL DEFAULT '0', "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_643857f54e1f934946e8cca28b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "market_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "marketDeckId" uuid NOT NULL, "userId" character varying NOT NULL, "text" text NOT NULL, "rating" integer NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b79fe8b349e2dc86e2afbc1a47b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "market_comment" ADD CONSTRAINT "FK_0a92b560ce5fbfe6ca3c1a1a301" FOREIGN KEY ("marketDeckId") REFERENCES "market_deck"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market_comment" DROP CONSTRAINT "FK_0a92b560ce5fbfe6ca3c1a1a301"`,
    );
    await queryRunner.query(`DROP TABLE "market_comment"`);
    await queryRunner.query(`DROP TABLE "market_deck"`);
  }
}
