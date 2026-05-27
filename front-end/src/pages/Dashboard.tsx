import { Bars3Icon, CalendarIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@heroicons/react/24/solid";
import PageContainer from "../components/PageContainer";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SideBarContext } from "../context/SideBarContext";
import type { AccountBalance, BudgetType, CategoryType, FinancialAccountType, Top5SpendingByBudgetByMonth, Top5SpendingByCategoryByMonth, TransactionType } from "../types";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import FormatCurrencyCAD from "../util/FormatCurrencyCAD";
import YearMonthDateSelectorDropdown from "../components/YearMonthDateSelectorDropdown";
import Dropdown from "../components/Dropdown";
import { DropdownContext } from "../context/DropdownContext";
import { MonthContext } from "../context/MonthContext";
import Button from "../components/Button";
import AddTransactionModal from "../components/modals/transactions/AddTransactionModal";
import AddBudgetModal from "../components/modals/budgets/AddBudgetModal";
import AddFinancialAccountModal from "../components/modals/financialAccounts/AddFinancialAccountModal";
import AddCategoryModal from "../components/modals/categories/AddCategoryModal";

const Dashboard = () => {

    const sideBarContext = useContext(SideBarContext);
    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;

    const [modal, setModal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const monthContext = useContext(MonthContext);
    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;

    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccountType[]>([]);
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [budgets, setBudgets] = useState<BudgetType[]>([]);

    const [recentTransactions, setRecentTransactions] = useState<TransactionType[]>([]);
    const [topSpentBudgets, setTopSpentBudgets] = useState<Top5SpendingByBudgetByMonth[]>([]);
    const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);

    const [topSpentCategories, setTopSpentCategories] = useState<Top5SpendingByCategoryByMonth[]>([]);
    const [currentBalanceTotal, setCurrentBalanceTotal] = useState<number>(0);
    const [totalMonthlySpending, setTotalMonthlySpending] = useState<number>(0);

    const circleMetric = () => {
        const categoryList: Top5SpendingByCategoryByMonth[] = getTopSpentCategoryMetricList();

        const conicSegments: string[] = [];
        let start = 0;

        categoryList.map((category, index) => {
            const fraction = (category.percentOfCircle ?? 0) * 360;

            if (index === 0) {                   
                start = fraction;
                conicSegments.push(`${category.color} 0deg ${fraction}deg`)
            } else if (index === categoryList.length - 1) {
                conicSegments.push(`${category.color} ${start}deg 360deg`)
            } else {          
                conicSegments.push(`${category.color} ${start}deg ${start + fraction}deg`)
                start += fraction;
            }
        })     

        return `conic-gradient(${conicSegments.join(', ')})`;
    }

    const getTopSpentCategoryMetricList = () => {
        if (topSpentCategories) {

            let allSpendingTotal = 0;
            topSpentCategories.map(category => allSpendingTotal += (category.amount ?? 0));

            return topSpentCategories.sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0)).map((category, index) => {
                switch (index) {
                    case 0:
                        return { ...category, color: '#ef4444', percentOfCircle: (category.amount ?? 0) / allSpendingTotal };
                    case 1:
                        return { ...category, color: '#3b82f6', percentOfCircle: (category.amount ?? 0) / allSpendingTotal };
                    case 2:
                        return { ...category, color: '#22c55e', percentOfCircle: (category.amount ?? 0) / allSpendingTotal };
                    case 3:
                        return { ...category, color: '#a855f7', percentOfCircle: (category.amount ?? 0) / allSpendingTotal };
                    case 4:
                        return { ...category, color: '#f97316', percentOfCircle: (category.amount ?? 0) / allSpendingTotal };
                    default:
                        return category;
                }
            });
        } else {
            return [];
        }
    }

    const getCurrentBalanceTotal = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/current-balance-total`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentBalanceTotal(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [token]);

    const getTotalMonthlySpending = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/total-monthly-spending`, {
                params: { selectedDate: monthContext?.month },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTotalMonthlySpending(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [monthContext, token]);

    const getTopSpendingByCategory = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/top-5-spending-by-category-by-month`, {
                params: { selectedDate: monthContext?.month },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTopSpentCategories(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [monthContext, token]);

    const getTopSpendingInBudgets = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/top-5-highest-spending-budgets-by-month`, {
                params: { selectedDate: monthContext?.month },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTopSpentBudgets(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [monthContext, token]);

    const getRecentTransactions = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/recent-transactions-by-month`, {
                params: { selectedDate: monthContext?.month },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRecentTransactions(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [monthContext, token]);

    const getAccountBalances = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics/account-balances`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAccountBalances(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.message };
            } else {
                return { success: true, error: "An unexpected error occurred." };
            }
        }
    }, [token]);

    const handleGetAllTransactions = useCallback(async () => {
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
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
                return;
            } else {
                setError("An unexpected error occurred.");
                return;
            }
        }
    }, [monthContext, token]);

    const handleGetAllFinancialAccounts = useCallback(async () => {
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
        }
    }, [monthContext, token]);

    const handleGetAllCategories = useCallback(async () => {
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
        }
    }, [monthContext, token]);

    const handleGetAllBudgets = useCallback(async () => {
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
    }, [monthContext, token]);

    const reloadDashboardData = useCallback(async () => {
        getCurrentBalanceTotal();
        getTotalMonthlySpending();
        getTopSpendingByCategory();
        getTopSpendingInBudgets();
        getRecentTransactions();
        getAccountBalances();
        handleGetAllTransactions();
        handleGetAllFinancialAccounts();
        handleGetAllCategories();
        handleGetAllBudgets();    
    }, [getAccountBalances,
        getCurrentBalanceTotal,
        getRecentTransactions,
        getTopSpendingByCategory,
        getTopSpendingInBudgets,
        getTotalMonthlySpending,
        handleGetAllCategories,
        handleGetAllFinancialAccounts,
        handleGetAllTransactions,
        handleGetAllBudgets
    ]);

    useEffect(() => {
        if (!token) {
            return;
        }
        const fetchData = async () => {
            await reloadDashboardData();
        }
        fetchData();

    }, [monthContext?.month, reloadDashboardData, token]);

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
        let filteredList = topSpentBudgets;

        switch (sortColumn.type) {
            case 'bName':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
                }
                break;
            case 'bAmount':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.amount - b.amount);
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.amount - a.amount);
                }
                break;
            case 'bPercentReached':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => (a.percentReached as number) - (b.percentReached as number));
                } else {
                    filteredList = [...filteredList].sort((a, b) => (b.percentReached as number) - (a.percentReached as number));
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [sortColumn, topSpentBudgets]);

    const filteredTransactions = useMemo(() => {
        let filteredList = recentTransactions;

        switch (sortColumn.type) {
            case 'tName':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
                }

                break;
            case 'tAmount':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.amount - b.amount);
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.amount - a.amount);
                }
                break;
            case 'tDate':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.date.localeCompare(b.date));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.date.localeCompare(a.date));
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [sortColumn, recentTransactions]);

    const filteredBankAccountBalances = useMemo(() => {
        let filteredList = accountBalances;

        switch (sortColumn.type) {
            case 'bankAccountName':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
                }

                break;
            case 'bankAccountBalance':
                if (sortColumn.direction === 'asc') {
                    filteredList = [...filteredList].sort((a, b) => a.balance - b.balance);
                } else {
                    filteredList = [...filteredList].sort((a, b) => b.balance - a.balance);
                }
                break;
            default:
                break;
        }

        return filteredList;

    }, [accountBalances, sortColumn.type, sortColumn.direction]);

    return (
        <PageContainer>
            {
                modal === 'addTransactionModal' ? (
                    <AddTransactionModal
                        categories={categories}
                        financialAccounts={financialAccounts}
                        token={token}
                        setModal={setModal}
                        transactions={transactions}
                        reloadDashboardData={reloadDashboardData}
                    />
                ) : modal === 'addBudgetModal' ? (
                    <AddBudgetModal
                        token={token}
                        setModal={setModal}
                        budgets={budgets}
                        categories={categories}
                        reloadDashboardData={reloadDashboardData}
                    />
                ) : modal === 'addFinancialAccountModal' ? (
                    <AddFinancialAccountModal
                        token={token}
                        setModal={setModal}
                        financialAccounts={financialAccounts}
                        reloadDashboardData={reloadDashboardData}
                    />
                ) : modal === 'addCategoryModal' ? (
                    <AddCategoryModal
                        token={token}
                        setModal={setModal}
                        categories={categories}
                        reloadDashboardData={reloadDashboardData}
                    />
                ) : (
                    <></>
                )
            }

            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Dashboard</h1>
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

                <div className="flex flex-wrap gap-2 sm:gap-4 w-full">

                    {error &&
                        <div className="text-red-600">
                            {error}
                            This is an error.
                        </div>
                    }

                    <div className="flex flex-row flex-wrap gap-4 w-full h-fit">
                        <div className="flex w-full gap-4 h-fit">

                            <div className="flex flex-wrap gap-4 grow">
                                <div className="p-4 border-1 border-gray-400 rounded-sm">
                                    <p className="text-lg">Current Balance (Total)</p>
                                    <p className="text-xl font-bold">{FormatCurrencyCAD(currentBalanceTotal)}</p>
                                </div>
                                <div className="p-4 border-1 border-gray-400 rounded-sm">
                                    <p className="text-lg">Total Spending</p>
                                    <p className="text-xl font-bold">{FormatCurrencyCAD(totalMonthlySpending)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 grow">
                                <div className="flex flex-col sm:flex-row gap-1">
                                    <Button
                                        text="Add Transaction"
                                        variant="primary-outline"
                                        extraClasses="inline-flex gap-2 h-fit w-full"
                                        onClick={() => setModal('addTransactionModal')}
                                    >
                                        <PlusIcon className="size-6" />
                                    </Button>
                                    <Button
                                        text="Add Budget"
                                        variant="primary-outline"
                                        extraClasses="inline-flex gap-2 h-fit w-full"
                                        onClick={() => setModal('addBudgetModal')}
                                    >
                                        <PlusIcon className="size-6" />
                                    </Button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-1">
                                    <Button
                                        text="Add Category"
                                        variant="primary-outline"
                                        extraClasses="inline-flex gap-2 h-fit w-full"
                                        onClick={() => setModal('addCategoryModal')}
                                    >
                                        <PlusIcon className="size-6" />
                                    </Button>
                                    <Button
                                        text="Add Bank Account"
                                        variant="primary-outline"
                                        extraClasses="inline-flex gap-2 h-fit w-full"
                                        onClick={() => setModal('addFinancialAccountModal')}
                                    >
                                        <PlusIcon className="size-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-row flex-wrap">
                        <div className="flex flex-col gap-4 flex-1 w-full">
                            <div className="flex p-4 flex-col border-1 border-gray-400 rounded-sm gap-2 flex-1 h-fit">
                                <p className="text-lg">Account Balances</p>

                                {financialAccounts && financialAccounts.length > 0 ?
                                    <table className="table-auto text-left">
                                        <thead className="border-b-1 border-b-gray-400">
                                            <tr>
                                                <th className="py-1 pr-1">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <span>Name</span>
                                                        {sortColumn.type === "bankAccountName" && sortColumn.direction === 'asc' ?
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bankAccountName")}>
                                                                <ChevronUpIcon className="size-4" />
                                                            </button>
                                                            :
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bankAccountName")}>
                                                                <ChevronDownIcon className="size-4" />
                                                            </button>
                                                        }
                                                    </div>
                                                </th>
                                                <th className="py-1 pr-1 flex">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <span>Amount</span>
                                                        {sortColumn.type === "bankAccountBalance" && sortColumn.direction === 'asc' ?
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bankAccountBalance")}>
                                                                <ChevronUpIcon className="size-4" />
                                                            </button>
                                                            :
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bankAccountBalance")}>
                                                                <ChevronDownIcon className="size-4" />
                                                            </button>
                                                        }
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="overflow-auto">
                                            {filteredBankAccountBalances.map(account =>
                                                <tr key={account.id} className="hover:bg-gray-200">
                                                    <td className="py-1 pr-1">
                                                        {account.name}
                                                    </td>
                                                    <td className="py-1 pr-1">
                                                        {FormatCurrencyCAD(account.balance)}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    :
                                    <p className="text-gray-600">
                                        No results.
                                    </p>
                                }
                            </div>

                            <div className="flex flex-wrap sm:gap-4 gap-2 grow">
                                <div className="flex p-4 flex-col border-1 border-gray-400 rounded-sm gap-2 flex-1 h-fit">
                                    <p className="text-lg">Recent Transactions</p>

                                    {recentTransactions && recentTransactions.length > 0 ?
                                        <table className="table-auto text-left">
                                            <thead className="border-b-1 border-b-gray-400">
                                                <tr className="">
                                                    <th className="py-1 pr-1">
                                                        <div className="flex flex-row items-center gap-1">
                                                            <span>Name</span>
                                                            {sortColumn.type === "tName" && sortColumn.direction === 'asc' ?
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tName")}>
                                                                    <ChevronUpIcon className="size-4" />
                                                                </button>
                                                                :
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tName")}>
                                                                    <ChevronDownIcon className="size-4" />
                                                                </button>
                                                            }
                                                        </div>
                                                    </th>
                                                    <th className="py-1 pr-1 flex">
                                                        <div className="flex flex-row items-center gap-1">
                                                            <span>Amount</span>
                                                            {sortColumn.type === "tAmount" && sortColumn.direction === 'asc' ?
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tAmount")}>
                                                                    <ChevronUpIcon className="size-4" />
                                                                </button>
                                                                :
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tAmount")}>
                                                                    <ChevronDownIcon className="size-4" />
                                                                </button>
                                                            }
                                                        </div>
                                                    </th>
                                                    <th className="py-1 pr-1">
                                                        <div className="flex flex-row items-center gap-1">
                                                            <span>Date</span>
                                                            {sortColumn.type === "tDate" && sortColumn.direction === 'asc' ?
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tDate")}>
                                                                    <ChevronUpIcon className="size-4" />
                                                                </button>
                                                                :
                                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("tDate")}>
                                                                    <ChevronDownIcon className="size-4" />
                                                                </button>
                                                            }
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="overflow-auto">
                                                {filteredTransactions.map(transaction =>
                                                    <tr key={transaction.id} className="hover:bg-gray-200">
                                                        <td className="py-1 pr-1">
                                                            {transaction.name}
                                                        </td>
                                                        <td className="py-1 pr-1">
                                                            {FormatCurrencyCAD(transaction.amount)}
                                                        </td>
                                                        <td className="py-1 pr-1">
                                                            {transaction.date}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        :
                                        <p className="text-gray-600">
                                            No results.
                                        </p>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row flex-wrap gap-4 flex-1">
                            <div className="flex p-4 flex-col border-1 border-gray-400 rounded-sm gap-2 flex-1 w-full">
                                <p className="text-lg">Top Spending by Category</p>                         

                                {getTopSpentCategoryMetricList().length > 0 ?
                                    <div className="flex md:flex-row flex-row sm:gap-4 gap-2 w-full min-w-[100%]">

                                        <div className="aspect-square w-32 h-32 md:w-48 md:h-48">
                                            <div className={`rounded-full w-full h-full relative`} style={{ background: circleMetric() }}></div>
                                        </div>

                                        <div className="flex flex-wrap flex-col w-full h-full gap-2 min-w-0">
                                            {/* categories, dynamically recieved */}
                                            {getTopSpentCategoryMetricList().map(category =>
                                                <div className="flex flex-col min-w-full flex-1 flex-shrink-0" key={category.id}>
                                                    <div className="inline-flex gap-1 items-center w-full min-w-0">
                                                        <div className="bg-red-600 size-4 rounded-sm" style={{ background: category.color }}></div>
                                                        <p className="font-semibold whitespace-nowrap w=full min-w-0">
                                                            {category.name}
                                                        </p>
                                                    </div>
                                                    <div className="">
                                                        <p>
                                                            {FormatCurrencyCAD(category.amount)} -
                                                            ({((category.percentOfCircle ?? 0) * 100).toFixed(1)}%)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    :
                                    <p className="text-gray-600">
                                        No results.
                                    </p>
                                }
                            </div>

                            <div className="flex p-4 flex-col border-1 border-gray-400 rounded-sm gap-2 grow h-fit w-full">
                                <p className="text-lg">Top Spending in Budgets</p>

                                {topSpentBudgets && topSpentBudgets.length > 0 ?
                                    <table className="table-auto text-left">
                                        <thead className="border-b-1 border-b-gray-400">
                                            <tr>
                                                <th className="py-1 pr-1">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <span>Name</span>
                                                        {sortColumn.type === "bName" && sortColumn.direction === 'asc' ?
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bName")}>
                                                                <ChevronUpIcon className="size-4" />
                                                            </button>
                                                            :
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bName")}>
                                                                <ChevronDownIcon className="size-4" />
                                                            </button>
                                                        }
                                                    </div>
                                                </th>
                                                <th className="py-1 pr-1">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <span>Amount</span>
                                                        {sortColumn.type === "bAmount" && sortColumn.direction === 'asc' ?
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bAmount")}>
                                                                <ChevronUpIcon className="size-4" />
                                                            </button>
                                                            :
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bAmount")}>
                                                                <ChevronDownIcon className="size-4" />
                                                            </button>
                                                        }
                                                    </div>
                                                </th>
                                                <th className="py-1 pr-1">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <span>% Reached</span>
                                                        {sortColumn.type === "bPercentReached" && sortColumn.direction === 'asc' ?
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bPercentReached")}>
                                                                <ChevronUpIcon className="size-4" />
                                                            </button>
                                                            :
                                                            <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("bPercentReached")}>
                                                                <ChevronDownIcon className="size-4" />
                                                            </button>
                                                        }
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="overflow-auto">
                                            {filteredBudgets.map(budget =>
                                                <tr key={budget.id} className="hover:bg-gray-200">
                                                    <td className="py-1 pr-1">
                                                        {budget.name}
                                                    </td>
                                                    <td className="py-1 pr-1">
                                                        {FormatCurrencyCAD(budget.amount)}
                                                    </td>
                                                    <td className="py-1 pr-1">
                                                        {`${budget.percentReached} %`}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    :
                                    <p className="text-gray-600">
                                        No results.
                                    </p>
                                }
                            </div>
                        </div>

                    </div>
                </div>

            </div >
        </PageContainer >
    )

}

export default Dashboard;