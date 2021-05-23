import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';

import createConnection from '../../../../database';
import { app } from "../../../../app";
import request from 'supertest';

let connection: Connection;
let idUser: string;
let idStatement01: string;

describe('Get statement operation controller', () => {
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
    });
    
    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('Should be able to get statement operation', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .get(`/api/v1/statements/${idStatement01}`)
            .set({
                Authorization: `Bearer ${token}`,
            });
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(idStatement01);
        expect(response.body.amount).toBe('100.00');
    });

    it('Should not be able to get statement operation with id not existent', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .get(`/api/v1/statements/1011dc5c-ce0f-4c6e-a5ea-6477e702e2d6`)
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(404);
    });    
});