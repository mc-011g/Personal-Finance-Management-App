import { useContext, useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { BudgetType, CategoryType } from "../../../types";
import axios from "axios";
import { MonthContext } from "../../../context/MonthContext";

interface AddBudgetModalType {
    budgets: BudgetType[],
    categories: CategoryType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setBudgets?: React.Dispatch<React.SetStateAction<BudgetType[]>>,
    token: string | undefined,
    reloadDashboardData?: () => void
}

const AddBudgetModal = ({ token, budgets, categories, setModal, setBudgets, reloadDashboardData }: AddBudgetModalType) => {

    const [name, setName] = useState<string>("");
    const [amount, setAmount] = useState<number>(1);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const monthContext = useContext(MonthContext);

    const handleAddBudget = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/budgets`,
                {
                    name,
                    amount,
                    categoryIds: selectedCategoryIds
                },
                {
                    params: { selectedDate: monthContext?.month },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data && setBudgets) {
                setBudgets([...budgets, response.data]);
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

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (selectedCategoryIds.length === 0) {
            setError("Please select at least one category.");
            return;
        }

        handleAddBudget();
    }

    return (
        <Modal
            error={error}
            closeModal={() => setModal(null)}
            title="Add Budget"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>

                    <label className="flex flex-col">
                        Amount:
                        <Input required maxLength={10000000000} name="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </label>

                    <label className="flex flex-col">
                        Category:

                        {categories.map(category =>
                            <label key={category.id} className="inline-flex gap-1">
                                <input
                                    type="checkbox"
                                    value={category.id}
                                    checked={selectedCategoryIds.includes(category.id)}
                                    onChange={e => {
                                        const id = category.id;
                                        if (e.target.checked) {
                                            setSelectedCategoryIds(prev => [...prev, id]);
                                        } else {
                                            setSelectedCategoryIds(prev => prev.filter(prevId => prevId !== id));
                                        }
                                    }}
                                />
                                {category.name}
                            </label>
                        )}
                    </label>
                </div>
            }
            submitAction={(e) => handleSubmit(e)}
        />
    )
}

export default AddBudgetModal;