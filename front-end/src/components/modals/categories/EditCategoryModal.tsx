import { useState } from "react";
import Input from "../../Input";
import Modal from "../../Modal";
import type { CategoryType } from "../../../types";
import axios from "axios";

interface EditCategoryModalType {
    categories: CategoryType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setCategories: React.Dispatch<React.SetStateAction<CategoryType[]>>,
    selectedCategory: CategoryType
    token: string | undefined
}

const EditCategoryModal = ({ token, categories, setModal, setCategories, selectedCategory }: EditCategoryModalType) => {
    const [name, setName] = useState<string>(selectedCategory.name);
    const [error, setError] = useState<string | null>(null);

    const handleEditCategory = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/categories/${selectedCategory.id}`,
                {
                    id: selectedCategory.id,
                    name
                },
                {             
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );        
            setCategories(categories.map(category =>
                category.id === response.data.id ? response.data : category
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
            title="Edit Category"
            content=
            {
                <div className="flex flex-col gap-2 overflow-auto">
                    <label className="flex flex-col">
                        Name:
                        <Input required maxLength={100} name="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                    </label>
                </div>
            }
            submitAction={(e) => { e.preventDefault(); handleEditCategory(); }}
        />
    )
}

export default EditCategoryModal;