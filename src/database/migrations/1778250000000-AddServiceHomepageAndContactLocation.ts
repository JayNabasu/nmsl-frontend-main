import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceHomepageAndContactLocation1778250000000 implements MigrationInterface {
  name = 'AddServiceHomepageAndContactLocation1778250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add showOnHomepage and homepageOrder columns to services table
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "showOnHomepage" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "homepageOrder" integer NOT NULL DEFAULT 0`,
    );

    // Add location column to contact_info table
    await queryRunner.query(
      `ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "location" character varying`,
    );

    // Set default location for existing rows that have no location
    await queryRunner.query(
      `UPDATE "contact_info" SET "location" = 'Abuja' WHERE "location" IS NULL`,
    );

    // Make location NOT NULL after setting defaults
    await queryRunner.query(
      `ALTER TABLE "contact_info" ALTER COLUMN "location" SET NOT NULL`,
    );

    // Add unique constraint on location (ignore if already exists)
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_contact_info_location" ON "contact_info" ("location")`,
    );

    // Add contactFormRecipient column
    await queryRunner.query(
      `ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "contactFormRecipient" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_contact_info_location"`);
    await queryRunner.query(`ALTER TABLE "contact_info" DROP COLUMN IF EXISTS "location"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "homepageOrder"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "showOnHomepage"`);
  }
}
