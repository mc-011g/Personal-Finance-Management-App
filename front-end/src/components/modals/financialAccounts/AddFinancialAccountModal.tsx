import { useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { FinancialAccountType } from "../../../types";
import axios from "axios";

interface AddFinancialAccountModalType {
    financialAccounts: FinancialAccountType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setFinancialAccounts?: React.Dispatch<React.SetStateAction<FinancialAccountType[]>>
    token: string | undefined,
    reloadDashboardData?: () => void
}

const AddFinancialAccountModal = ({ token, financialAccounts, setModal, setFinancialAccounts, reloadDashboardData }: AddFinancialAccountModalType) => {
    const [name, setName] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const handleAddFinancialAccount = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/financial-accounts`,
                {
                    name,
                    balance,
                }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            );
            if (response.data && setFinancialAccounts) {
                setFinancialAccounts([...financialAccounts, response.data]);
            }
            setModal(null);
            if (reloadDashboardData) {
                reloadDashboardData();
            }
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
            title="Add Account"
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
            submitAction={(e) => { e.preventDefault(); handleAddFinancialAccount(); }}
        />
    )
}

export default AddFinancialAccountModal;