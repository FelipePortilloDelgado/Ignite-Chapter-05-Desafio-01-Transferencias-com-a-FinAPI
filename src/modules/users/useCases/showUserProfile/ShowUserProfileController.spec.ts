import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';

import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;
let idUser: string;

describe('Show user profile controller', () => {

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

    it('Should be able to show the user profile with valid token', async () => {

        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'test@email.com.br',
            password: 'test'
        });

        const { token } = responseToken.body;

        const response = await request(app)
            .get('/api/v1/profile')
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('email');
        expect(response.body.id).toBe(idUser);
    });

    it('Should not be able to show a user profile with invalid token', async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: 'invalid@email.com.br',
            password: 'invalid'
        });

        expect(responseToken.status).toBe(401);
    });

});
