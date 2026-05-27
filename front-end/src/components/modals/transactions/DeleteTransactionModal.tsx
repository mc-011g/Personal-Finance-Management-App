import Modal from "../../Modal";
import type { TransactionType } from "../../../types";
import axios from "axios";
import { useState } from "react";

interface DeleteTransactionModalType {
    transactions: TransactionType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setTransactions: React.Dispatch<React.SetStateAction<TransactionType[]>>,
    selectedTransaction: TransactionType,
    token: string | undefined
}

const DeleteTransactionModal = ({ token, transactions, setModal, setTransactions, selectedTransaction }: DeleteTransactionModalType) => {

    const [error, setError] = useState<string | null>(null);

    const handleDeleteTransaction = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/transactions/${selectedTransaction.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTransactions([...transactions].map(transaction => transaction).filter(transaction => transaction.id !== selectedTransaction.id));
            setModal(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);         
                return;   
            } else {
                setError("An unexpected error occurred.");       
                return;
            }
        }
    }

    return (
        <Modal
            error={error}
            closeModal={() => setModal(null)}
            title="Delete Transaction"
            content=
            {
                <p>Are you sure you want to delete transaction: <b>{selectedTransaction.name}</b>?</p>
            }
            submitAction={(e) => {e.preventDefault(); handleDeleteTransaction();}}
        />
    )
}

export default DeleteTransactionModal;