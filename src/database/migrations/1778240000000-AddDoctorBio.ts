import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorBio1778240000000 implements MigrationInterface {
    name = 'AddDoctorBio1778240000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "bio" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "bio"`);
    }
}
