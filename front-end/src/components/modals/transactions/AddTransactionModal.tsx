import { useContext, useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { CategoryType, FinancialAccountType, TransactionType } from "../../../types";
import axios from "axios";
import { MonthContext } from "../../../context/MonthContext";

interface AddTransactionModalType {
    transactions: TransactionType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setTransactions?: React.Dispatch<React.SetStateAction<TransactionType[]>>,
    token: string | undefined,
    financialAccounts: FinancialAccountType[],
    categories: CategoryType[],
    reloadDashboardData?: () => void
}

const AddTransactionModal = ({ token, transactions, categories, financialAccounts, setModal, setTransactions, reloadDashboardData }: AddTransactionModalType) => {

    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toLocaleDateString());
    const [amount, setAmount] = useState<number>(1);
    const [selectedFinancialAccountId, setSelectedFinancialAccountId] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const monthContext = useContext(MonthContext);

    const handleAddTransaction = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/transactions`,
                {
                    name,
                    date,
                    amount,
                    financialAccountId: selectedFinancialAccountId,
                    categoryId: selectedCategoryId
                }, {
                params: { selectedDate: monthContext?.month },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            );
            if (response.data && setTransactions) {
                setTransactions([...transactions, response.data]);
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
            title="Add Transaction"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>

                    <label className="flex flex-col">
                        Amount ($):
                        <Input required max={10000000000} name="number" type="number" step={0.01} value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </label>

                    <div className="flex flex-col">
                        <span className="mb-1 w-full border-b-1 border-b-gray-400">Financial Account:</span>

                        <div className="flex flex-col gap-1 overflow-y-auto">
                            {financialAccounts.map(account =>
                                <label key={account.id} className="inline-flex gap-2">
                                    <Input
                                        required
                                        type="radio"
                                        name="financialAccountSelect"
                                        extraClasses="w-min"
                                        value={account.id}
                                        id={account.id}
                                        onChange={() => setSelectedFinancialAccountId(account.id)}
                                    />
                                    {account.name}
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="mb-1 w-full border-b-1 border-b-gray-400">Category:</span>

                        <div className="flex flex-col gap-1 overflow-y-auto">
                            {categories.map(category =>
                                <label key={category.id} className="inline-flex gap-2">
                                    <Input
                                        required
                                        extraClasses="w-min"
                                        type="radio"
                                        name="categorySelect"
                                        value={category.id}
                                        id={category.id}
                                        onChange={() => setSelectedCategoryId(category.id)}
                                    />
                                    {category.name}
                                </label>
                            )}
                        </div>
                    </div>

                    <label className="flex flex-col">
                        Date:
                        <Input required name="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </label>
                </div>
            }
            submitAction={(e) => { e.preventDefault(); handleAddTransaction() }}
        />
    )
}

export default AddTransactionModal;