interface ICreateTransferDTO {
    sender_user_id: string;
    receiver_user_id: string;
    amount: number;
	description: string;
}

export {ICreateTransferDTO}