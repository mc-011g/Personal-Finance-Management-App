import { useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { CategoryType } from "../../../types";
import axios from "axios";

interface AddCategoryModalType {
    categories: CategoryType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setCategories?: React.Dispatch<React.SetStateAction<CategoryType[]>>,
    token: string | undefined,
    reloadDashboardData?: () => void
}

const AddCategoryModal = ({ token, categories, setModal, setCategories, reloadDashboardData }: AddCategoryModalType) => {
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleAddCategory = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/categories`,
                {
                    name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data && setCategories) {
                setCategories([...categories, response.data]);
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
            title="Add Category"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>
                </div>
            }
            submitAction={(e) => { e.preventDefault(); handleAddCategory() }}
        />
    )
}

export default AddCategoryModal;