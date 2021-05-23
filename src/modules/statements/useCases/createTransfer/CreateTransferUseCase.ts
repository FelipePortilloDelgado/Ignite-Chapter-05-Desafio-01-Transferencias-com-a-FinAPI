import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    TRANSFER = 'transfer',
}

@injectable()
class CreateTransferUseCase {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,
    
        @inject('StatementsRepository')
        private statementsRepository: IStatementsRepository

    ){}

    async execute({ sender_user_id, receiver_user_id, amount, description,  }: ICreateTransferDTO) {
        
        const sender_user = await this.usersRepository.findById(sender_user_id);

        if(!sender_user) {
            throw new CreateStatementError.UserNotFound();
        }

        const receiver_user = await this.usersRepository.findById(receiver_user_id);

        if(!receiver_user) {
            throw new CreateStatementError.UserNotFound();
        }

        const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_user_id });

        if (balance < amount) {
          throw new CreateStatementError.InsufficientFunds()
        }
        
        const sender_statement = await this.statementsRepository.create({
            user_id: sender_user_id,
            amount,
            description,
            type: 'transfer' as OperationType,
        });
        
        const receiver_statement = await this.statementsRepository.create({
            user_id: receiver_user_id,
            amount,
            description,
            type: 'transfer' as OperationType,
            sender_id: sender_user_id,
        });

        return [
            sender_statement,
            receiver_statement
        ];

    }

}

export {CreateTransferUseCase}