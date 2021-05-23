import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
    DEPOSIT = 'deposit'
}

describe('Get statement operation', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    });

    it('Should be able to get statement operation', async () => {
        const password = await hash('123', 8);
        const user = await usersRepositoryInMemory.create({name: 'Test', email: 'email@test.com', password});
        const deposit = await statementsRepositoryInMemory.create({
            user_id: user.id || '',
            description: 'deposit',
            amount: 50,
            type: OperationType.DEPOSIT
        });

        const statement = await getStatementOperationUseCase.execute({user_id: user.id || '', statement_id: deposit.id || ''})

        expect(statement).toHaveProperty('id');
        expect(statement.amount).toBe(50);
        expect(statement.user_id).toBe(user.id);
    });

    it('Should not be able to get statement operation with invalid user', async () => {
        expect(async () => {
            const password = await hash('123', 8);
            const user = await usersRepositoryInMemory.create({name: 'Test', email: 'email@test.com', password});
            const deposit = await statementsRepositoryInMemory.create({
                user_id: user.id || '',
                description: 'deposit',
                amount: 50,
                type: OperationType.DEPOSIT
            });
            
            await getStatementOperationUseCase.execute({user_id: 'invalidUser', statement_id: deposit.id || ''})
            
        }).rejects.toBeInstanceOf(AppError);
    });

    it('Should not be able to get statement operation with invalid statement id', async () => {
        expect(async () => {
            const password = await hash('123', 8);
            const user = await usersRepositoryInMemory.create({name: 'Test', email: 'email@test.com', password});
            const deposit = await statementsRepositoryInMemory.create({
                user_id: user.id || '',
                description: 'deposit',
                amount: 50,
                type: OperationType.DEPOSIT
            });
            
            await getStatementOperationUseCase.execute({user_id: user.id || '', statement_id: 'invalidStatement'})
            
        }).rejects.toBeInstanceOf(AppError);
    });

});