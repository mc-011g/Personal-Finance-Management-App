import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@heroicons/react/24/solid";
import PageContainer from "../components/PageContainer";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Input from "../components/Input";
import Button from "../components/Button";
import { useContext, useEffect, useMemo, useState } from "react";
import Dropdown from "../components/Dropdown";
import type { CategoryType } from "../types";
import AddCategoryModal from "../components/modals/categories/AddCategoryModal";
import EditCategoryModal from "../components/modals/categories/EditCategoryModal";
import DeleteCategoryModal from "../components/modals/categories/DeleteCategoryModal";
import { DropdownContext } from "../context/DropdownContext";
import axios from "axios";
import { SideBarContext } from "../context/SideBarContext";
import { AuthContext } from "../context/AuthContext";

const Categories = () => {

    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;
    const sideBarContext = useContext(SideBarContext);

    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;

    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>(categories[0]);
    const [searchText, setSearchText] = useState("");
    const [modal, setModal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        const handleGetAllCategories = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCategories(response.data);

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
        handleGetAllCategories();
    }, [token]);

    useEffect(() => {
        const resetSearchText = () => {
            setSearchText("");
        }
        resetSearchText();
    }, []);

    const [sortColumn, setSortColumn] = useState<{ type: string, direction: string }>({ type: "name", direction: "asc" });
    
    const handleSort = (type: string) => {
        setSortColumn(prev => (
            {
                type,
                direction: prev.type === type ? (prev.direction === "asc" ? "desc" : "asc") : "asc"
            }
        ));
    }

    const filteredCategories = useMemo(() => {
        let filteredList = categories;

        if (searchText) {
            filteredList = filteredList.filter(category => category.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        switch (sortColumn.type) {
            case 'name':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [sortColumn, searchText, categories]);

    return (
        <PageContainer>
            {
                modal === 'addCategoryModal' ? (
                    <AddCategoryModal token={token} setModal={setModal} setCategories={setCategories} categories={categories} />
                ) : modal === 'editCategoryModal' ? (
                    <EditCategoryModal token={token} selectedCategory={selectedCategory} setModal={setModal} setCategories={setCategories} categories={categories} />
                ) : modal === 'deleteCategoryModal' ? (
                    <DeleteCategoryModal token={token} selectedCategory={selectedCategory} setModal={setModal} setCategories={setCategories} categories={categories} />
                ) : (
                    <></>
                )
            }

            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Categories</h1>
                </div>
                <button className={`${sideBarContext?.show ? 'hidden md:block' : 'block md:hidden'} hover:cursor-pointer`} onClick={() => sideBarContext?.setShow(true)}>
                    <Bars3Icon className="size-8" />
                </button>
            </div>

            <div className="p-4 flex flex-col bg-white gap-2 sm:gap-4 h-full w-full">

                <div className="inline-flex justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center">
                        <label className="inline-flex gap-2 items-baseline">
                            Search:
                            <Input placeholder="Category name" value={searchText} onChange={e => setSearchText(e.target.value)} />
                        </label>
                    </div>

                    <Button text="Add Category" variant="secondary" onClick={() => setModal('addCategoryModal')}>
                        <PlusIcon className="size-6" />
                    </Button>
                </div>

                {error &&
                    <div className="text-red-600">
                        {error}
                    </div>
                }

                {categories && categories.length > 0 ?
                    <div className="flex-1 border-1 border-gray-400 rounded-sm overflow-y-auto">
                        <table className="table-auto w-full text-left">
                            <thead className="border-b-1 border-b-gray-400">
                                <tr>
                                    <th className="p-4">

                                        <div className="flex flex-row items-center gap-1">
                                            <span>Name</span>
                                            {sortColumn.type === "name" && sortColumn.direction === 'asc' ?
                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("name")}>
                                                    <ChevronUpIcon className="size-4" />
                                                </button>
                                                :
                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("name")}>
                                                    <ChevronDownIcon className="size-4" />
                                                </button>
                                            }
                                        </div>
                                    </th>
                                    <th>
                                        <span>Options</span>
                                    </th>
                                </tr>
                            </thead>
                      
                            <tbody className="overflow-auto">
                                {filteredCategories.map(category =>
                                    <tr key={category.id} className="hover:bg-gray-200">
                                        <td className="p-4">{category.name}</td>
                                        <td>
                                            <div className="relative w-fit">
                                                {
                                                    dropdown?.id === `categoryOptions${category.id}` &&
                                                    <Dropdown ref={dropdownRef} items={[
                                                        <button className="hover:cursor-pointer px-2 py-1"
                                                            onClick={
                                                                () => {
                                                                    setSelectedCategory({
                                                                        id: category.id, name: category.name,
                                                                    });
                                                                    setModal('editCategoryModal');
                                                                }
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        ,
                                                        <button className="hover:cursor-pointer px-2 py-1"
                                                            onClick={
                                                                () => {
                                                                    setSelectedCategory({
                                                                        id: category.id, name: category.name,
                                                                    });
                                                                    setModal('deleteCategoryModal');
                                                                }
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    ]}
                                                    />
                                                }
                                                <button className="hover:bg-green-600 rounded-sm hover:text-white hover:cursor-pointer" onClick={() => dropdownContext?.handleShowDropdown?.(`categoryOptions${category.id}`)}>
                                                    <EllipsisHorizontalIcon className="size-6" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    :
                    <p className="text-gray-600 w-full h-full flex items-center justify-center">
                        No results.
                    </p>
                }
            </div>
        </PageContainer>
    )
}

export default Categories;