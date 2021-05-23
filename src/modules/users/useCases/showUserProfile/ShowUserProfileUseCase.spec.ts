import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show user', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    });

    it('Should be able to show a user', async () => {
        const user = await usersRepositoryInMemory.create({name: 'Test', email: 'email@test.com', password: '123'});

        const showUser = await showUserProfileUseCase.execute(user.id || '');

        expect(showUser).toEqual(user);
    });

    it('Should not be able to show a user non existent', async () => {
        expect(async () => {
            await showUserProfileUseCase.execute('invalidId');
        }).rejects.toBeInstanceOf(AppError);
    });

});