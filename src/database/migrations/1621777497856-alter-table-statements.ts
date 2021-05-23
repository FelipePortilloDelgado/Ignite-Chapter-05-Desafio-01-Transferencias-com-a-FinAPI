import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class alterTableStatements1621777497856 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('statements', 
            new TableColumn({
                name: 'sender_id',
                type: 'uuid',
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey('statements', 
            new TableForeignKey({
                name: 'fk_statements_users',
                columnNames: ['sender_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('statements', 'fk_statements_users');

        await queryRunner.dropColumn('statements', 'sender_id');
    }

}
