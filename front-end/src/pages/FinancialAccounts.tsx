import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "@heroicons/react/24/solid";
import PageContainer from "../components/PageContainer";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Input from "../components/Input";
import Button from "../components/Button";
import { useContext, useEffect, useMemo, useState } from "react";
import Dropdown from "../components/Dropdown";
import type { FinancialAccountType } from "../types";
import AddFinancialAccountModal from "../components/modals/financialAccounts/AddFinancialAccountModal";
import DeleteFinancialAccountModal from "../components/modals/financialAccounts/DeleteFinancialAccountModal";
import EditFinancialAccountModal from "../components/modals/financialAccounts/EditFinancialAccountModal";
import axios from "axios";
import { DropdownContext } from "../context/DropdownContext";
import { SideBarContext } from "../context/SideBarContext";
import FormatCurrencyCAD from "../util/FormatCurrencyCAD";
import { AuthContext } from "../context/AuthContext";

const FinancialAccounts = () => {

    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;
    const sideBarContext = useContext(SideBarContext);

    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;

    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccountType[]>([]);
    const [selectedFinancialAccount, setSelectedFinancialAccount] = useState<FinancialAccountType>(financialAccounts[0]);
    
    const [searchText, setSearchText] = useState("");
    const [modal, setModal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        const getFinancialAccounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/financial-accounts`, {
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
        }
        getFinancialAccounts();
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

    const filteredAccounts = useMemo(() => {
        let filteredList = financialAccounts;

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
            case 'balance':
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

    }, [sortColumn, searchText, financialAccounts]);

    return (
        <PageContainer>
            {
                modal === 'addFinancialAccountModal' ? (
                    <AddFinancialAccountModal token={token} setModal={setModal} setFinancialAccounts={setFinancialAccounts} financialAccounts={financialAccounts} />
                ) : modal === 'editFinancialAccountModal' ? (
                    <EditFinancialAccountModal token={token} selectedFinancialAccount={selectedFinancialAccount} setModal={setModal} setFinancialAccounts={setFinancialAccounts} financialAccounts={financialAccounts} />
                ) : modal === 'deleteFinancialAccountModal' ? (
                    <DeleteFinancialAccountModal token={token} selectedFinancialAccount={selectedFinancialAccount} setModal={setModal} setFinancialAccounts={setFinancialAccounts} financialAccounts={financialAccounts} />
                ) : (
                    <></>
                )
            }

            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Financial Accounts</h1>
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
                            <Input placeholder="Account name" onChange={(e) => setSearchText(e.target.value)} value={searchText} />
                        </label>
                    </div>
                    <Button text="Add Account" variant="secondary" onClick={() => setModal('addFinancialAccountModal')}>
                        <PlusIcon className="size-6" />
                    </Button>
                </div>

                {error &&
                    <div className="text-red-600">
                        {error}
                    </div>
                }

                {financialAccounts && financialAccounts.length > 0 ?
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

                                            <span>Balance</span>

                                            {sortColumn.type === "balance" && sortColumn.direction === 'asc' ?
                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("balance")}>
                                                    <ChevronUpIcon className="size-4" />
                                                </button>
                                                :
                                                <button type="button" className="hover:cursor-pointer" onClick={() => handleSort("balance")}>
                                                    <ChevronDownIcon className="size-4" />
                                                </button>
                                            }
                                        </div>
                                    </th>
                                    <th className="p-1">Options</th>
                                </tr>
                            </thead>                       
                            
                            <tbody className="overflow-auto">
                                {filteredAccounts.map(account =>
                                    <tr key={account.id} className="hover:bg-gray-200">
                                        <td className="p-4">{account.name}</td>
                                        <td>{FormatCurrencyCAD(account.balance)}</td>
                                        <td>
                                            <div className="relative w-fit">
                                                {
                                                    dropdown?.id === `accountOptions${account.id}` &&
                                                    <Dropdown ref={dropdownRef} items={[
                                                        <button className="hover:cursor-pointer w-full h-full px-2 py-1"
                                                            onClick={
                                                                () => {
                                                                    setSelectedFinancialAccount({
                                                                        id: account.id, balance: account.balance, name: account.name
                                                                    });
                                                                    setModal('editFinancialAccountModal');
                                                                }
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        ,
                                                        <button className="hover:cursor-pointer px-2 py-1"
                                                            onClick={
                                                                () => {
                                                                    setSelectedFinancialAccount({
                                                                        id: account.id, balance: account.balance, name: account.name
                                                                    });
                                                                    setModal('deleteFinancialAccountModal');
                                                                }
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    ]}
                                                    />
                                                }
                                                <button className="hover:bg-green-600 rounded-sm hover:text-white hover:cursor-pointer" onClick={() => dropdownContext?.handleShowDropdown?.(`accountOptions${account.id}`)}>
                                                    <EllipsisHorizontalIcon className="size-6" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                }

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

export default FinancialAccounts;