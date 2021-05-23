import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';

import createConnection from '../../../../database';
import { app } from "../../../../app";
import request from 'supertest';

let connection: Connection;
let idUser: string;
let idStatement01: string;
let idStatement02: string;

describe('Get balance controller', () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    
        idUser = uuid();
        const password = await hash('test', 8);
    
        await connection.query(
            `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
            values('${idUser}', 'test', 'test@email.com.br', '${password}', 'now()', 'now()')`
        );

        idStatement01 = uuid();
        await connection.query(
            `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
            values('${idStatement01}', '${idUser}', 'deposit 01', 100, 'deposit', 'now()', 'now()')`
        );

        idStatement02 = uuid();
        await connection.query(
            `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
            values('${idStatement02}', '${idUser}', 'withdraw 01', 50, 'withdraw', 'now()', 'now()')`
        );        
    });
    
    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('Should be able to get balance', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .get('/api/v1/statements/balance')
            .set({
                Authorization: `Bearer ${token}`,
            });
        
        expect(response.status).toBe(200);
        expect(response.body.balance).toBe(50);
        expect(response.body.statement.length).toBe(2);
    })
});