import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationOtherServicesTable1776020000000 implements MigrationInterface {
  name = 'AddLocationOtherServicesTable1776020000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."location_other_services_location_enum" AS ENUM(
        'Abuja',
        'Lagos',
        'Benin',
        'Kaduna',
        'Port Harcourt',
        'Warri'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "location_other_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "location" "public"."location_other_services_location_enum" NOT NULL,
        "services" jsonb NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_location_other_services_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_location_other_services_location"
      ON "location_other_services" ("location")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_location_other_services_location"
    `);

    await queryRunner.query(`
      DROP TABLE "location_other_services"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."location_other_services_location_enum"
    `);
  }
}
