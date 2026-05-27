import { useContext, useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { BudgetType, CategoryType } from "../../../types";
import axios from "axios";
import { MonthContext } from "../../../context/MonthContext";

interface EditBudgetModalType {
    budgets: BudgetType[],
    categories: CategoryType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setBudgets: React.Dispatch<React.SetStateAction<BudgetType[]>>,
    selectedBudget: BudgetType,
    token: string | undefined
}

const EditBudgetModal = ({ token, budgets, categories, setModal, setBudgets, selectedBudget }: EditBudgetModalType) => {

    const [name, setName] = useState<string>(selectedBudget.name);
    const [amount, setAmount] = useState<number>(selectedBudget.amount);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(selectedBudget.categoryDTOs?.map(dto => dto.id) ?? []);
    const [error, setError] = useState<string | null>(null);
    const monthContext = useContext(MonthContext);

    const handleEditBudget = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/budgets/${selectedBudget.id}`,
                {
                    id: selectedBudget.id,
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
            if (response.data) {
                setBudgets(budgets.map(budget =>
                    budget.id === response.data.id ? response.data : budget
                ));
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

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (selectedCategoryIds.length === 0) {
            setError("Please select at least one category.");
            return;
        }

        handleEditBudget();
    }

    return (
        <Modal
            error={error}
            closeModal={() => setModal(null)}
            title="Edit Budget"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>

                    <label className="flex flex-col">
                        Amount:
                        <Input required max={10000000000} name="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1 border-b-1 border-b-gray-400">Category:</span>
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

export default EditBudgetModal;