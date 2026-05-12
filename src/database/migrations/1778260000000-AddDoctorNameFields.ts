import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorNameFields1778260000000 implements MigrationInterface {
  name = 'AddDoctorNameFields1778260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "firstName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "lastName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "designation" character varying`,
    );

    // Best-effort populate from existing name: extract designation prefix, then split remainder
    await queryRunner.query(`
      UPDATE "doctors"
      SET
        "designation" = CASE
          WHEN "name" LIKE 'Dr. %' THEN 'Dr.'
          WHEN "name" LIKE 'Nurse %' THEN 'Nurse'
          ELSE NULL
        END
      WHERE "firstName" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "doctors"
      SET
        "firstName" = split_part(
          CASE
            WHEN "designation" = 'Dr.' THEN trim(substring("name" from 5))
            WHEN "designation" = 'Nurse' THEN trim(substring("name" from 7))
            ELSE "name"
          END,
          ' ', 1
        ),
        "lastName" = CASE
          WHEN array_length(string_to_array(
            CASE
              WHEN "designation" = 'Dr.' THEN trim(substring("name" from 5))
              WHEN "designation" = 'Nurse' THEN trim(substring("name" from 7))
              ELSE "name"
            END,
            ' '
          ), 1) > 1
          THEN trim(substring(
            CASE
              WHEN "designation" = 'Dr.' THEN trim(substring("name" from 5))
              WHEN "designation" = 'Nurse' THEN trim(substring("name" from 7))
              ELSE "name"
            END
            FROM position(' ' IN
              CASE
                WHEN "designation" = 'Dr.' THEN trim(substring("name" from 5))
                WHEN "designation" = 'Nurse' THEN trim(substring("name" from 7))
                ELSE "name"
              END
            ) + 1
          ))
          ELSE ''
        END
      WHERE "firstName" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "designation"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "lastName"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "firstName"`);
  }
}
