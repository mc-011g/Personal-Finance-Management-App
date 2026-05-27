import { useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { FinancialAccountType } from "../../../types";
import axios from "axios";

interface EditFinancialAccountModalType {
    financialAccounts: FinancialAccountType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setFinancialAccounts: React.Dispatch<React.SetStateAction<FinancialAccountType[]>>,
    selectedFinancialAccount: FinancialAccountType,
    token: string | undefined
}

const EditFinancialAccountModal = ({ token, setModal, setFinancialAccounts, selectedFinancialAccount, financialAccounts }: EditFinancialAccountModalType) => {
    const [name, setName] = useState<string>(selectedFinancialAccount.name);
    const [balance, setBalance] = useState<number>(selectedFinancialAccount.balance);
    const [error, setError] = useState<string | null>(null);

    const handleEditFinancialAccount = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/financial-accounts/${selectedFinancialAccount.id}`,
                {
                    id: selectedFinancialAccount.id,
                    name,
                    balance
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setFinancialAccounts(financialAccounts.map(account =>
                account.id === response.data.id ? response.data : account
            ));
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
            title="Edit Account"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>

                    <label className="flex flex-col">
                        Balance:
                        <Input required maxLength={100000000000} name="amount" type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} />
                    </label>
                </div>
            }
            submitAction={(e) => { e.preventDefault(); handleEditFinancialAccount(); }}
        />
    )
}

export default EditFinancialAccountModal;