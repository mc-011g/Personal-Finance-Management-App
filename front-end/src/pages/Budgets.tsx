import { Bars3Icon, CalendarIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@heroicons/react/24/solid";
import PageContainer from "../components/PageContainer";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Input from "../components/Input";
import Button from "../components/Button";
import { useContext, useEffect, useMemo, useState } from "react";
import Dropdown from "../components/Dropdown";
import axios from "axios";
import type { BudgetType, CategoryType } from "../types";
import AddBudgetModal from "../components/modals/budgets/AddBudgetModal";
import DeleteBudgetModal from "../components/modals/budgets/DeleteBudgetModal";
import EditBudgetModal from "../components/modals/budgets/EditBudgetModal";
import { DropdownContext } from "../context/DropdownContext";
import { SideBarContext } from "../context/SideBarContext";
import FormatCurrencyCAD from "../util/FormatCurrencyCAD";
import { AuthContext } from "../context/AuthContext";
import YearMonthDateSelectorDropdown from "../components/YearMonthDateSelectorDropdown";
import { MonthContext } from "../context/MonthContext";
import { Link } from "react-router";

const Budgets = () => {

    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;
    const sideBarContext = useContext(SideBarContext);

    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;
    const monthContext = useContext(MonthContext);

    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const [selectedBudget, setSelectedBudget] = useState<BudgetType>(budgets[0]);
    const [searchText, setSearchText] = useState("");
    const [modal, setModal] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loadedCategories, setLoadedCategories] = useState<boolean>(false);

    useEffect(() => {
        if (!token) {
            return;
        }

        const handleGetAllBudgets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/budgets`, {
                    params: { selectedDate: monthContext?.month },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setBudgets(response.data);
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
        handleGetAllBudgets();

        const handleGetAllCategories = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
                    params: { selectedDate: monthContext?.month },
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
            } finally {
                setLoadedCategories(true);
            }
        }
        handleGetAllCategories();
    }, [monthContext?.month, token]);

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

    const filteredBudgets = useMemo(() => {
        let filteredList = budgets;

        if (searchText) {
            filteredList = filteredList.filter(account => account.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        switch (sortColumn.type) {
            case 'name':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
                }
                break;
            case 'amount':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.amount - b.amount);
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.amount - a.amount);
                }
                break;
            case 'percentReached':
                if (sortColumn.direction === 'asc') {
                    filteredList = ([...filteredList].sort((a, b) => (a.percentReached as number) - (b.percentReached as number)));
                } else {
                    filteredList = ([...filteredList].sort((a, b) => (b.percentReached as number) - (a.percentReached as number)));
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [sortColumn, searchText, budgets]);

    return (
        <PageContainer>
            {
                modal === 'addBudgetModal' ? (

                    <AddBudgetModal token={token} setModal={setModal} setBudgets={setBudgets} budgets={budgets} categories={categories} />

                ) : modal === 'editBudgetModal' ? (

                    <EditBudgetModal token={token} selectedBudget={selectedBudget} setModal={setModal} setBudgets={setBudgets} budgets={budgets} categories={categories} />

                ) : modal === 'deleteBudgetModal' ? (

                    <DeleteBudgetModal token={token} selectedBudget={selectedBudget} setModal={setModal} setBudgets={setBudgets} budgets={budgets} />

                ) : (
                    <></>
                )
            }

            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Budgets</h1>
                    <div className="inline-flex gap-2 items-center relative ">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl">
                            {monthContext?.month &&
                                new Date(monthContext.month).toLocaleDateString("default", { month: "long", year: "numeric" })
                            }
                        </h2>
                        {
                            dropdown?.id === "changeMonthYearSelector" &&
                            <Dropdown ref={dropdownRef} dateSelector={true} items={[
                                <YearMonthDateSelectorDropdown />
                            ]}
                            />
                        }
                        <button type="button" className="hover:cursor-pointer" onClick={() => dropdownContext?.handleShowDropdown?.(`changeMonthYearSelector`)}>
                            <CalendarIcon className="size-6" />
                        </button>
                    </div>

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
                            <Input placeholder="Budget name" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                        </label>
                    </div>
                    <Button disabled={categories.length === 0} text="Add Budget" variant="secondary" onClick={() => setModal('addBudgetModal')}>
                        <PlusIcon className="size-6" />
                    </Button>
                </div>

                {error &&
                    <div className="text-red-600">
                        {error}
                    </div>
                }

                {(categories.length !== 0 && loadedCategories) &&
                    <>
                        {budgets && budgets.length > 0 ?
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
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>Amount</span>

                                                    {sortColumn.type === "amount" && sortColumn.direction === 'asc' ?
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("amount")}>
                                                            <ChevronUpIcon className="size-4" />
                                                        </button>
                                                        :
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("amount")}>
                                                            <ChevronDownIcon className="size-4" />
                                                        </button>
                                                    }
                                                </div>
                                            </th>
                                            <th>
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>Categories</span>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>% Reached</span>

                                                    {sortColumn.type === "percentReached" && sortColumn.direction === 'asc' ?
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("percentReached")}>
                                                            <ChevronUpIcon className="size-4" />
                                                        </button>
                                                        :
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("percentReached")}>
                                                            <ChevronDownIcon className="size-4" />
                                                        </button>
                                                    }
                                                </div>
                                            </th>
                                            <th>
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>Options</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>                                  
                                    <tbody className="overflow-auto">
                                        {filteredBudgets.map(budget =>
                                            <tr key={budget.id} className="hover:bg-gray-200">
                                                <td className="p-4">{budget.name}</td>
                                                <td>{FormatCurrencyCAD(budget.amount)}</td>
                                                {/* line below is incorrect */}
                                                <td>
                                                    <ul className="list-disc ml-4">
                                                        {budget.categoryDTOs?.map(dto =>
                                                            <li key={dto.id}>
                                                                {dto.name}
                                                            </li>
                                                        )}
                                                    </ul>
                                                </td>
                                                <td className="flex flex-col">
                                                    <div className="font-semibold">{budget.percentReached} %</div>
                                                    <div>({FormatCurrencyCAD(budget.totalSpent as number)} / {FormatCurrencyCAD(budget.amount)})</div>
                                                </td>
                                                <td>
                                                    <div className="relative w-fit">
                                                        {
                                                            dropdown?.id === `budgetOptions${budget.id}` &&
                                                            <Dropdown ref={dropdownRef} items={[
                                                                <button className="hover:cursor-pointer px-2 py-1"
                                                                    onClick={
                                                                        () => {
                                                                            setSelectedBudget(budget);
                                                                            setModal('editBudgetModal');
                                                                        }
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>
                                                                ,
                                                                <button className="hover:cursor-pointer px-2 py-1"
                                                                    onClick={() => {
                                                                        setSelectedBudget(budget);
                                                                        setModal('deleteBudgetModal');
                                                                    }
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            ]}
                                                            />
                                                        }
                                                        <button className="hover:bg-green-600 rounded-sm hover:text-white hover:cursor-pointer" onClick={() => dropdownContext?.handleShowDropdown?.(`budgetOptions${budget.id}`)}>
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
                    </>
                }
                {loadedCategories && categories.length === 0 &&
                    <div className="flex flex-col gap-2 h-full w-full justify-center items-center">
                        <p>You need at least one category before creating a budget.</p>
                        <Link to={'/categories'} className="w-fit bg-green-600 text-white hover:cursor-pointer hover:bg-green-700 rounded-sm py-1 px-2 ">
                            Go to Categories
                        </Link>
                    </div>
                }

            </div>
        </PageContainer>
    )
}

export default Budgets;