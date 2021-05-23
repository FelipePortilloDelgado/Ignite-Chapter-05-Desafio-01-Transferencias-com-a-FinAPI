import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';

import createConnection from '../../../../database';
import { app } from "../../../../app";
import request from 'supertest';

let connection: Connection;
let idUser: string;

describe('Create statement controller', () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    
        idUser = uuid();
        const password = await hash('test', 8);
    
        await connection.query(
          `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
          values('${idUser}', 'test', 'test@email.com.br', '${password}', 'now()', 'now()')
          `
        );
    });
    
    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('Should be able to create a deposit', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .post('/api/v1/statements/deposit')
            .send({
                amount: 100, 
                description: 'Deposit 01'
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
    });

    it('Should be able to create a withdraw', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        await request(app)
            .post('/api/v1/statements/deposit')
            .send({
                amount: 100, 
                description: 'Deposit 01'
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        const response = await request(app)
            .post('/api/v1/statements/withdraw')
            .send({
                amount: 50, 
                description: 'Withdraw 01'
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
    });

    it('Should not be able to create a withdraw with insufficient found', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .post('/api/v1/statements/withdraw')
            .send({
                amount: 500, 
                description: 'Withdraw 01'
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(400);
    });    


    it('Should not be able to create a statement with invalid user', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'invalid@email.com.br',
            password: 'invalid'
        });

        expect(responseToken.status).toBe(401);
    });

})