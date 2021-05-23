import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe('Get balance', () => {

    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
    });

    it('Should be able to get balance', async () => {
        const password = await hash('123', 8);
        const user = await usersRepositoryInMemory.create({name: 'Test', email: 'email@test.com', password});

        const deposit = [500, 200];
        const withdraw = [201.50, 100];

        await statementsRepositoryInMemory.create({ user_id: user.id || '', amount: deposit[0], description: '01 - deposit', type: OperationType.DEPOSIT });
        await statementsRepositoryInMemory.create({ user_id: user.id || '', amount: withdraw[0], description: '02 - withdraw', type: OperationType.WITHDRAW });
        await statementsRepositoryInMemory.create({ user_id: user.id || '', amount: withdraw[1], description: '03 - withdraw', type: OperationType.WITHDRAW });
        await statementsRepositoryInMemory.create({ user_id: user.id || '', amount: deposit[1], description: '04 - deposit', type: OperationType.DEPOSIT });

        const balance = await getBalanceUseCase.execute({user_id: user.id || ''});

        const totalDeposit = deposit.reduce((totalDeposit, value) => {
            return totalDeposit + value;
        })

        const totalWithdraw = withdraw.reduce((totalWithdraw, value) => {
            return totalWithdraw + value;
        })

        expect(balance.balance).toBe(totalDeposit - totalWithdraw);
        expect(balance.statement.length).toBe(4);
    });

    it('Should not be able to get balance with invalid user', () => {
        expect(async () => {
            await getBalanceUseCase.execute({user_id: 'invalidId'});
        }).rejects.toBeInstanceOf(AppError);
    });

});