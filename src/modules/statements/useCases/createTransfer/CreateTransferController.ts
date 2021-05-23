import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {

    async execute(request: Request, response: Response): Promise<Response>{
        const { id: sender_user_id } = request.user;
        const { user_id: receiver_user_id } = request.params;
        const { amount, description } = request.body;

        const createTransferUseCase = container.resolve(CreateTransferUseCase);

        const statement_transfer = await createTransferUseCase.execute({
            sender_user_id, 
            receiver_user_id, 
            amount, 
            description
        });

        return response.status(201).json(statement_transfer);
    }

}

export {CreateTransferController}