import Modal from "../../Modal";
import type { BudgetType } from "../../../types";
import axios from "axios";
import { useState } from "react";

interface DeleteBudgetModalType {
    budgets: BudgetType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setBudgets: React.Dispatch<React.SetStateAction<BudgetType[]>>,
    selectedBudget: BudgetType
    token: string | undefined
}

const DeleteBudgetModal = ({ token, budgets, setModal, setBudgets, selectedBudget }: DeleteBudgetModalType) => {

    const [error, setError] = useState<string | null>(null);

    const handleDeleteBudget = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/budgets/${selectedBudget.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBudgets([...budgets].map(budget => budget).filter(budget => budget.id !== selectedBudget.id));
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
            title="Delete Budget"
            content=
            {
                <p>Are you sure you want to delete budget: <b>{selectedBudget.name}</b>?</p>
            }
            submitAction={(e) => { e.preventDefault(); handleDeleteBudget() }}
        />
    )
}

export default DeleteBudgetModal;