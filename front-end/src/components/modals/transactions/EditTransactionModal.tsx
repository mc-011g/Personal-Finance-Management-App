import { useContext, useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { CategoryType, FinancialAccountType, TransactionType } from "../../../types";
import axios from "axios";
import { MonthContext } from "../../../context/MonthContext";

interface EditTransactionModalType {
    transactions: TransactionType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setTransactions: React.Dispatch<React.SetStateAction<TransactionType[]>>,
    selectedTransaction: TransactionType,
    token: string | undefined,
    financialAccounts: FinancialAccountType[]
    categories: CategoryType[]
}

const EditTransactionModal = ({ token, transactions, financialAccounts, categories, setModal, setTransactions, selectedTransaction }: EditTransactionModalType) => {
    const [name, setName] = useState<string>(selectedTransaction.name);
    const [date, setDate] = useState<string>(selectedTransaction.date);
    const [amount, setAmount] = useState<number>(selectedTransaction.amount);

    const [selectedFinancialAccountId, setSelectedFinancialAccountId] = useState<string>(selectedTransaction.financialAccountId?.toString() ?? "");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(selectedTransaction.categoryId?.toString() ?? "");
    const monthContext = useContext(MonthContext);

    const [error, setError] = useState<string | null>(null);

    const handleEditTransaction = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/transactions/${selectedTransaction.id}`,
                {
                    id: selectedTransaction.id,
                    name,
                    date,
                    amount,
                    financialAccountId: selectedFinancialAccountId,
                    categoryId: selectedCategoryId
                },
                {
                    params: { selectedDate: monthContext?.month },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data) {
                setTransactions(transactions.map(transaction =>
                    transaction.id === response.data.id ? response.data : transaction
                ));
            } else {          
                  setTransactions([...transactions].map(transaction => transaction).filter(transaction => transaction.id !== selectedTransaction.id));
            }
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
            title="Edit Transaction"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>

                    <label className="flex flex-col">
                        Amount:
                        <Input max={10000000000} name="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </label>

                    <label className="flex flex-col">
                        Date:
                        <Input required name="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
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
                                        defaultChecked={account.id === selectedTransaction.financialAccountId}
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
                                        type="radio"
                                        name="categorySelect"
                                        extraClasses="w-min"
                                        value={category.id}
                                        id={category.id}
                                        onChange={() => setSelectedCategoryId(category.id)}
                                        defaultChecked={category.id === selectedTransaction.categoryId}
                                    />
                                    {category.name}
                                </label>
                            )}
                        </div>
                    </div>

                </div>
            }
            submitAction={(e) => { e.preventDefault(); handleEditTransaction(); }}
        />
    )
}

export default EditTransactionModal;