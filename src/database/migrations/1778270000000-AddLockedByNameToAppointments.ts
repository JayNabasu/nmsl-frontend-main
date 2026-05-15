import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLockedByNameToAppointments1778270000000 implements MigrationInterface {
    name = 'AddLockedByNameToAppointments1778270000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "lockedByName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "lockedByName"`);
    }
}
