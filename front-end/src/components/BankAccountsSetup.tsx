import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid"
import type { FinancialAccountType } from "../types"
import Button from "./Button"
import Input from "./Input"
import { useRef } from "react"

interface BankAccountsSetupProps {
    error: string | null,
    bankAccounts: FinancialAccountType[],
    setBankAccounts: React.Dispatch<React.SetStateAction<FinancialAccountType[]>>,
    step: number,
    handleGoToNextStep: () => void,
    setError: (error: string | null) => void
}

export const BankAccountsSetup = ({ error, bankAccounts, setBankAccounts, step, handleGoToNextStep }: BankAccountsSetupProps) => {

    const nameInputRef = useRef<HTMLInputElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);

    const checkInputValidationBeforeNext = () => {
        if (nameInputRef.current && !nameInputRef.current.checkValidity()) {
            nameInputRef.current.reportValidity();
            return;
        }
        if (amountInputRef.current && !amountInputRef.current.checkValidity()) {
            amountInputRef.current.reportValidity();
            return;
        }
        handleGoToNextStep();
    }

    const handleAddNewBankAccount = () => {
        setBankAccounts([...bankAccounts,
        {
            id: (bankAccounts.length + 1).toString(),
            name: "",
            balance: 0
        }
        ])
    }

    const handleDeleteBankAccount = (id: string) => {
        setBankAccounts(prev => prev.filter(account => account.id !== id));
    }

    return (
        <div className="mx-auto flex flex-col">
            <div className="py-4 inline-flex justify-between gap-4">
                <h2 className="text-2xl md:text-xl lg:text-lg font-bold">Add Bank Accounts</h2>
                <h2 className="text-xl md:text-lg lg:text-md font-bold">Step {step} of 4</h2>
            </div>

            <div className="flex flex-col justify-between h-full">

                <div className="flex flex-col gap-4 w-full sm:w-96 md:w-128">

                    {bankAccounts.map(account =>
                        <div key={account.id} className="relative p-4 border-1 border-gray-400 rounded-md flex flex-col gap-2">

                            {bankAccounts.at(0)?.id !== account.id &&
                                <button
                                    type="button"
                                    className="absolute top-4 right-4"
                                    onClick={() => handleDeleteBankAccount(account.id)}
                                >
                                    <XMarkIcon className="size-6 text-gray-600 hover:text-black hover:cursor-pointer" />
                                </button>
                            }

                            <label className="flex flex-col gap-2 items-baseline">
                                Name:
                                <Input ref={nameInputRef}
                                    required maxLength={50} type="text" extraClasses="w-full" placeholder="Name" value={account.name}
                                    onChange={e =>
                                        setBankAccounts((prev: FinancialAccountType[]) =>
                                            prev.map((prevAccount: FinancialAccountType) =>
                                                prevAccount.id === account.id ?
                                                    { ...prevAccount, name: e.target.value } : prevAccount
                                            )
                                        )
                                    }
                                />
                            </label>
                            <label className="flex flex-col inline-flex gap-2 items-baseline">
                                Balance:
                                <Input required max={10000000000} type="number" extraClasses="w-full" placeholder="Balance" value={account.balance}
                                    onChange={e =>
                                        setBankAccounts(prev =>
                                            prev.map(prevAccount =>
                                                prevAccount.id === account.id ?
                                                    { ...prevAccount, balance: Number(e.target.value) } : prevAccount
                                            )
                                        )}
                                />
                            </label>
                        </div>
                    )}
                    {error &&
                        <div className="text-red-600">
                            {error}
                        </div>
                    }
                    <div>
                        <Button text="Add Another" type="button" variant="primary-outline" extraClasses="inline-flex items-center" onClick={() => handleAddNewBankAccount()}>
                            <PlusIcon className="size-6" />
                        </Button>
                    </div>
                </div>

                <div className="ml-auto pt-4 inline-flex gap-2">
                    <div className="">
                        <Button text="Next" variant="primary" onClick={() => checkInputValidationBeforeNext()} />
                    </div>
                </div>
            </div>
        </div>
    )
}