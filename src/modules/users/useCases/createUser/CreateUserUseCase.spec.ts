import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let repositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create user', () => {

    beforeEach(() => {
        repositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(repositoryInMemory);
    })

    it('Should be able to create a new user ', async () => {
        const name = "Test";
        const email = "email@test.com";
        const password = "123"

        const user = await createUserUseCase.execute({name, email, password});

        expect(user).toHaveProperty('id');
    });

    it('Should not be able to create a user already exists', async () => {
        expect(async () => {
            const name = "Test";
            const email = "email@test.com";
            const password = "123"
    
            await createUserUseCase.execute({name, email, password});
    
            await createUserUseCase.execute({name, email, password});
        }).rejects.toBeInstanceOf(AppError);

    });

})