import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';

import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;

describe('Authenticate user controller', () => {

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    
        const id = uuid();
        const password = await hash('test', 8);
    
        await connection.query(
          `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
          values('${id}', 'test', 'test@email.com.br', '${password}', 'now()', 'now()')
          `
        );
    });
    
    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('Should be able to authenticate user', async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
    });

    it('Should not be able to authenticate invalid email', async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'invalidEmail',
            password: 'test'
        });

        expect(response.status).toBe(401);
    });

    it('Should not be able to authenticate invalid password', async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'invalidPassword'
        });

        expect(response.status).toBe(401);
    });

});