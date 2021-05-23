import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let repositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate user', () => {

    beforeEach(async () => {
        repositoryInMemory = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(repositoryInMemory);
    })

    it('Should be able to authenticate a user', async () => {
        
        const password = await hash('123', 8);
        await repositoryInMemory.create({name: 'Test', email: 'email@test.com', password})


        const token = await authenticateUserUseCase.execute({email: 'email@test.com', password: '123'});

        expect(token);
        expect(token).toHaveProperty('user');
        expect(token).toHaveProperty('token');
    });

    it('Should not be able to authenticate a invalid user', async () => {
        expect(async () => {
            await authenticateUserUseCase.execute({email: 'invalidEmail@email.com', password: 'invalidPassword'});
        }).rejects.toBeInstanceOf(AppError);
    });

});