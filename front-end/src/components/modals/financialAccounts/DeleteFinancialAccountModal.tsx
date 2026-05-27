import Modal from "../../Modal";
import type { FinancialAccountType } from "../../../types";
import axios from "axios";
import { useState } from "react";

interface DeleteFinancialAccountModalType {
    financialAccounts: FinancialAccountType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setFinancialAccounts: React.Dispatch<React.SetStateAction<FinancialAccountType[]>>,
    selectedFinancialAccount: FinancialAccountType,
    token: string | undefined
}

const DeleteFinancialAccountModal = ({ token, financialAccounts, setModal, setFinancialAccounts, selectedFinancialAccount }: DeleteFinancialAccountModalType) => {

    const [error, setError] = useState<string | null>(null);

    const handleDeleteTransaction = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/financial-accounts/${selectedFinancialAccount.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFinancialAccounts([...financialAccounts].map(account => account).filter(account => account.id !== selectedFinancialAccount.id));
            setModal(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data || error.message);  
                return;     
            } else {
                setError("An unexpected error occurred");         
                return; 
            }
        }
    }

    return (
        <Modal
            error={error}
            closeModal={() => setModal(null)}
            title="Delete Account"
            content=
            {
                <p>Are you sure you want to delete financial account: <b>{selectedFinancialAccount.name}</b>?</p>
            }
            submitAction={(e) => { e.preventDefault(); handleDeleteTransaction() }}
        />
    )
}

export default DeleteFinancialAccountModal;