import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import {ICreateStatementDTO} from '../../useCases/createStatement/ICreateStatementDTO';
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe('Create statement', () => {

    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    });

    it('Should be able to deposit', async () => {
        // Create a user
        const user = await usersRepositoryInMemory.create({name: 'test', email: 'test@test.com', password: '123'})

        const statement = await createStatementUseCase.execute({
            user_id: user.id || '',
            description: 'Deposit 01',
            amount: 650.00,
            type: OperationType.DEPOSIT,
        });

        expect(statement).toHaveProperty('id');
        expect(statement.amount).toBe(650);    
    });

    it('Should be able to withdraw', async () => {
        // Create a user
        const user = await usersRepositoryInMemory.create({name: 'test', email: 'test@test.com', password: '123'})
        await statementsRepositoryInMemory.create({
            user_id: user.id || '',
            description: 'Deposit 01',
            amount: 650.00,
            type: OperationType.DEPOSIT,
        });

        const statement = await createStatementUseCase.execute({
            user_id: user.id || '',
            description: 'Withdraw 01',
            amount: 50.00,
            type: OperationType.WITHDRAW,
        });

        expect(statement).toHaveProperty('id');
        expect(statement.amount).toBe(50);    
    });

    it('Should not be able to withdraw with insufficient found', async () => {
        expect(async () => {
            const user = await usersRepositoryInMemory.create({name: 'test', email: 'test@test.com', password: '123'})

            await createStatementUseCase.execute({
                user_id: user.id || '',
                description: 'Withdraw 01',
                amount: 50.00,
                type: OperationType.WITHDRAW,
            });  
        }).rejects.toBeInstanceOf(AppError);
    });

    it('Should not be able to deposit a value less than zero', async () => {
        expect(async () => {
            const user = await usersRepositoryInMemory.create({name: 'test', email: 'test@test.com', password: '123'})

            await createStatementUseCase.execute({
                user_id: user.id || '',
                description: 'Withdraw 01',
                amount: -10.00,
                type: OperationType.DEPOSIT,
            });  
        }).rejects.toBeInstanceOf(AppError);
    });

    it('Should not be able to create a statement by users non existent', async () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: '123',
                description: 'Withdraw 01',
                amount: 10.00,
                type: OperationType.DEPOSIT,
            });  
        }).rejects.toBeInstanceOf(AppError);
    });

});