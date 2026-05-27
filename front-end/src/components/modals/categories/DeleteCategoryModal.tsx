import Modal from "../../Modal";
import type { CategoryType } from "../../../types";
import axios from "axios";
import { useState } from "react";

interface DeleteCategoryModalType {
    categories: CategoryType[],
    setModal: React.Dispatch<React.SetStateAction<string | null>>,
    setCategories: React.Dispatch<React.SetStateAction<CategoryType[]>>,
    selectedCategory: CategoryType
    token: string | undefined
}

const DeleteCategoryModal = ({ token, categories, setModal, setCategories, selectedCategory }: DeleteCategoryModalType) => {

    const [error, setError] = useState<string | null>(null);

    const handleDeleteCategory = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${selectedCategory.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`                    
                }
            });
            setCategories([...categories].map(category => category).filter(category => category.id !== selectedCategory.id));
            setModal(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {       
                setError(error.response?.data || error.message);
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
            title="Delete Category"
            content=
            {
                <p>Are you sure you want to delete category: <b>{selectedCategory.name}</b>?</p>
            }
            submitAction={(e) => {e.preventDefault(); handleDeleteCategory();}}
        />
    )
}

export default DeleteCategoryModal;