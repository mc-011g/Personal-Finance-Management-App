import { Bars3Icon, CalendarIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@heroicons/react/24/solid";
import PageContainer from "../components/PageContainer";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Input from "../components/Input";
import Button from "../components/Button";
import { useContext, useEffect, useMemo, useState } from "react";
import Dropdown from "../components/Dropdown";
import axios from "axios";
import type { CategoryType, FinancialAccountType, TransactionType } from "../types";
import AddTransactionModal from "../components/modals/transactions/AddTransactionModal";
import EditTransactionModal from "../components/modals/transactions/EditTransactionModal";
import DeleteTransactionModal from "../components/modals/transactions/DeleteTransactionModal";
import { DropdownContext } from "../context/DropdownContext";
import { SideBarContext } from "../context/SideBarContext";
import FormatCurrencyCAD from "../util/FormatCurrencyCAD";
import { AuthContext } from "../context/AuthContext";
import { MonthContext } from "../context/MonthContext";
import YearMonthDateSelectorDropdown from "../components/YearMonthDateSelectorDropdown";
import { Link } from "react-router";

const Transactions = () => {

    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;

    const sideBarContext = useContext(SideBarContext);
    const authContext = useContext(AuthContext);
    const monthContext = useContext(MonthContext);

    const token = authContext?.session?.token;

    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>(transactions[0]);
    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccountType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const [searchText, setSearchText] = useState("");
    const [modal, setModal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [loadedCategories, setLoadedCategories] = useState<boolean>(false);
    const [loadedFinancialAccounts, setLoadedFinancialAccounts] = useState<boolean>(false);
    const [loadedTransactions, setLoadedTransactions] = useState<boolean>(false);

    useEffect(() => {
        if (!token) {
            return;
        }

        const handleGetAllTransactions = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions`,
                    {
                        params: { selectedDate: monthContext?.month },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setTransactions(response.data);
                setLoadedTransactions(true);
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
        handleGetAllTransactions();

        const handleGetAllFinancialAccounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/financial-accounts`,
                    {
                        params: { selectedDate: monthContext?.month },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                setFinancialAccounts(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.message);
                    return;
                } else {
                    setError("An unexpected error occurred.");
                    return;
                }
            } finally {
                setLoadedFinancialAccounts(true);
            }
        }
        handleGetAllFinancialAccounts();

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
   
    const filteredTransactions = useMemo(() => {
        let filteredList = transactions;

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
            case 'date':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.date.localeCompare(b.date));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.date.localeCompare(a.date));
                }
                break;
            case 'categoryName':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => (a.categoryName as string).localeCompare(b.categoryName as string));
                } else {
                    filteredList = [...filteredList].sort((a, b) => (b.categoryName as string).localeCompare(a.categoryName as string));
                }
                break;
            case 'financialAccountName':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => (a.financialAccountName as string).localeCompare(b.financialAccountName as string));
                } else {
                    filteredList = [...filteredList].sort((a, b) => (b.financialAccountName as string).localeCompare(a.financialAccountName as string));
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [sortColumn, searchText, transactions]);

    return (
        <PageContainer>

            {/* test modal view  */}
            {
                modal === 'addTransactionModal' ? (
                    <AddTransactionModal categories={categories} financialAccounts={financialAccounts} token={token} setModal={setModal} setTransactions={setTransactions} transactions={transactions} />
                ) : modal === 'editTransactionModal' ? (
                    <EditTransactionModal categories={categories} financialAccounts={financialAccounts} token={token} selectedTransaction={selectedTransaction} setModal={setModal} setTransactions={setTransactions} transactions={transactions} />
                ) : modal === 'deleteTransactionModal' ? (
                    <DeleteTransactionModal token={token} selectedTransaction={selectedTransaction} setModal={setModal} setTransactions={setTransactions} transactions={transactions} />
                ) : (
                    <></>
                )
            }

            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        Transactions
                    </h1>

                    <div className="inline-flex gap-2 items-center relative">
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

            <div className="p-4 flex flex-col bg-white gap-2 gap-4 h-full w-full overflow-y-hidden">

                <div className="inline-flex justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center">
                        <label className="inline-flex gap-2 items-baseline">
                            Search:
                            <Input placeholder="Transaction name" value={searchText} onChange={e => setSearchText(e.target.value)} type="search" />
                        </label>
                    </div>

                    <Button
                        disabled={(categories.length === 0 || financialAccounts.length === 0)}
                        text="Add Transaction"
                        variant="primary-outline"
                        onClick={() => setModal('addTransactionModal')}
                    >
                        <PlusIcon className="size-6" />
                    </Button>

                </div>

                {error &&
                    <div className="text-red-600">
                        {error}
                    </div>
                }

                {loadedFinancialAccounts && (financialAccounts.length > 0 && categories.length > 0) &&
                    <>
                        {loadedTransactions && (transactions && transactions.length > 0) ?
                            <div className="flex-1 border-1 border-gray-400 rounded-sm overflow-y-auto">
                                <table className="table-auto w-full text-left">
                                    <thead className="">
                                        <tr className="sticky top-0 z-10 bg-white p-4 shadow-[0_1px_0_0_rgba(156,163,175,1)]">
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
                                                    <span>Date</span>

                                                    {sortColumn.type === "date" && sortColumn.direction === 'asc' ?

                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("date")}>
                                                            <ChevronUpIcon className="size-4" />
                                                        </button>
                                                        :
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("date")}>
                                                            <ChevronDownIcon className="size-4" />
                                                        </button>
                                                    }
                                                </div>
                                            </th>
                                            <th>
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>Category</span>

                                                    {sortColumn.type === "categoryName" && sortColumn.direction === 'asc' ?

                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("categoryName")}>
                                                            <ChevronUpIcon className="size-4" />
                                                        </button>
                                                        :
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("categoryName")}>
                                                            <ChevronDownIcon className="size-4" />
                                                        </button>
                                                    }
                                                </div>
                                            </th>
                                            <th>
                                                <div className="flex flex-row items-center gap-1">
                                                    <span>Financial Account</span>

                                                    {sortColumn.type === "financialAccountName" && sortColumn.direction === 'asc' ?

                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("financialAccountName")}>
                                                            <ChevronUpIcon className="size-4" />
                                                        </button>
                                                        :
                                                        <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("financialAccountName")}>
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

                                        {filteredTransactions.map(transaction =>
                                            <tr key={transaction.id} className="hover:bg-gray-200">
                                                <td className="p-4">{transaction.name}</td>
                                                <td>{FormatCurrencyCAD(transaction.amount)}</td>
                                                <td>{transaction.date}</td>
                                                <td>{transaction.categoryName}</td>
                                                <td>{transaction.financialAccountName}</td>
                                                <td>
                                                    <div className="relative w-fit">
                                                        {
                                                            dropdown?.id === `transactionOptions${transaction.id}` &&
                                                            <Dropdown ref={dropdownRef} items={[
                                                                <button className="hover:cursor-pointer px-2 py-1"
                                                                    onClick={
                                                                        () => {
                                                                            setSelectedTransaction({
                                                                                id: transaction.id,
                                                                                amount: transaction.amount,
                                                                                name: transaction.name,
                                                                                date: transaction.date,
                                                                                categoryId: transaction.categoryId,
                                                                                financialAccountId: transaction.financialAccountId
                                                                            });
                                                                            setModal('editTransactionModal');
                                                                        }
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>
                                                                ,
                                                                <button className="hover:cursor-pointer px-2 py-1"
                                                                    onClick={
                                                                        () => {
                                                                            setSelectedTransaction({
                                                                                id: transaction.id,
                                                                                amount: transaction.amount,
                                                                                name: transaction.name,
                                                                                date: transaction.date
                                                                            });
                                                                            setModal('deleteTransactionModal');
                                                                        }
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            ]}
                                                            />
                                                        }
                                                        <button
                                                            className="hover:bg-green-600 rounded-sm hover:text-white hover:cursor-pointer"
                                                            onClick={() => dropdownContext?.handleShowDropdown?.(`transactionOptions${transaction.id}`)}
                                                        >
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

                {loadedFinancialAccounts && financialAccounts.length === 0 ?
                    <div className="flex flex-col gap-2 h-full w-full justify-center items-center">
                        <p>You need at least one financial account before creating a transaction.</p>
                        <Link to={'/financial-accounts'} className="w-fit bg-green-600 text-white hover:cursor-pointer hover:bg-green-700 rounded-sm py-1 px-2 ">
                            Go to Financial Accounts
                        </Link>
                    </div>
                    :
                    loadedCategories && categories.length === 0 &&
                    <div className="flex flex-col gap-2 h-full w-full justify-center items-center">
                        <p>You need at least one category before creating a transaction.</p>
                        <Link to={'/categories'} className="w-fit bg-green-600 text-white hover:cursor-pointer hover:bg-green-700 rounded-sm py-1 px-2 ">
                            Go to Categories
                        </Link>
                    </div>
                }

            </div>
        </PageContainer >
    )
}

export default Transactions;