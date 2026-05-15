import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSiteSettingsTable1778280000000 implements MigrationInterface {
    name = 'CreateSiteSettingsTable1778280000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "site_settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "telemedicineEnabled" boolean NOT NULL DEFAULT false,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_site_settings" PRIMARY KEY ("id")
            )
        `);

        // Seed a default row
        await queryRunner.query(`
            INSERT INTO "site_settings" ("telemedicineEnabled")
            SELECT false
            WHERE NOT EXISTS (SELECT 1 FROM "site_settings")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "site_settings"`);
    }
}
