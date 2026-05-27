import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid"
import type { CategoryType, FinancialAccountType, TransactionType } from "../types"
import Button from "./Button"
import Input from "./Input"
import { useRef } from "react"

interface TransactionSetupProps {
    transactions: TransactionType[],
    setTransactions: React.Dispatch<React.SetStateAction<TransactionType[]>>,
    step: number,
    setStep: (step: number) => void,
    handleGoToNextStep: () => void,
    error: string | null,
    categories: CategoryType[],
    bankAccounts: FinancialAccountType[],
    setError: (error: string | null) => void
}

export const TransactionsSetup = ({ setError, categories, bankAccounts, handleGoToNextStep, transactions, setTransactions, step, setStep }: TransactionSetupProps) => {

    const nameInputRef = useRef<HTMLInputElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const categoryInputRef = useRef<HTMLInputElement>(null);
    const financialAccountInputRef = useRef<HTMLInputElement>(null);

    const handleAddNewTransaction = () => {
        setTransactions([...transactions,
        {
            id: (transactions.length + 1).toString(),
            name: "",
            amount: 0,
            date: (new Date()).toLocaleDateString(),
            categoryId: "",
            financialAccountId: ""
        }
        ])
    }

    const checkInputValidationBeforeNext = () => {
        if (nameInputRef.current && !nameInputRef.current.checkValidity()) {
            nameInputRef.current.reportValidity();
            return;
        }
        if (amountInputRef.current && !amountInputRef.current.checkValidity()) {
            amountInputRef.current.reportValidity();
            return;
        }
        if (dateInputRef.current && !dateInputRef.current.checkValidity()) {
            dateInputRef.current.reportValidity();
            return;
        }
        if (categoryInputRef.current && !categoryInputRef.current.checkValidity()) {
            categoryInputRef.current.reportValidity();
            return;
        }
        if (financialAccountInputRef.current && !financialAccountInputRef.current.checkValidity()) {
            financialAccountInputRef.current.reportValidity();
            return;
        }
        handleGoToNextStep();
    }

    const handleDeleteTransaction = (id: string) => {     
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    }

    return (
        <div className="mx-auto flex flex-col">
            <div className="py-4 inline-flex justify-between gap-4">
                <h2 className="text-2xl md:text-xl lg:text-lg font-bold">Add Transactions</h2>
                <h2 className="text-xl md:text-lg lg:text-md font-bold">Step {step} of 4</h2>
            </div>

            <div className="flex flex-col justify-between h-full">

                <div className="flex flex-col gap-4 w-full sm:w-96 md:w-128">                   

                    {transactions.map(transaction =>
                        <div key={transaction.id} className="relative p-4 border-1 border-gray-400 rounded-md flex flex-col gap-2">

                            {transactions.at(0)?.id !== transaction.id &&
                                <button
                                    type="button"
                                    className="absolute top-4 right-4"
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                >
                                    <XMarkIcon className="size-6 text-gray-600 hover:text-black hover:cursor-pointer" />
                                </button>
                            }

                            <label className="flex flex-col gap-2 items-baseline">
                                Name:
                                <Input ref={nameInputRef} required maxLength={50} type="text" extraClasses="w-full" placeholder="Name" value={transaction.name}
                                    onChange={e =>
                                        setTransactions((prev: TransactionType[]) =>
                                            prev.map((prevTransaction: TransactionType) =>
                                                prevTransaction.id === transaction.id ?
                                                    { ...prevTransaction, name: e.target.value } : prevTransaction
                                            )
                                        )
                                    }
                                />
                            </label>

                            <label className="flex flex-col inline-flex gap-2 items-baseline">
                                Amount ($):
                                <Input ref={amountInputRef} required max={10000000000} type="number" extraClasses="w-full" placeholder="Amount" value={transaction.amount}
                                    onChange={e =>
                                        setTransactions(prevTransaction =>
                                            prevTransaction.map(prevTransaction =>
                                                prevTransaction.id === transaction.id ?
                                                    { ...prevTransaction, amount: Number(e.target.value) } : prevTransaction
                                            )
                                        )}
                                />
                            </label>

                            <label className="flex flex-col inline-flex gap-2 items-baseline">
                                Date:
                                <Input ref={dateInputRef} required type="date" extraClasses="w-full" placeholder="Amount" value={transaction.date}
                                    onChange={e =>
                                        setTransactions(prevTransaction =>
                                            prevTransaction.map(prevTransaction =>
                                                prevTransaction.id === transaction.id ?
                                                    { ...prevTransaction, date: e.target.value } : prevTransaction
                                            )
                                        )}
                                />
                            </label>

                            Categories:
                            {categories && categories.map(category =>
                                <label key={category.id} className="inline-flex gap-1 flex flex-col">

                                    <div className="inline-flex gap-1">
                                        <input
                                            name={`categorySelect${transaction.id}`}
                                            required
                                            ref={categoryInputRef}
                                            type="radio"
                                            value={category.id}
                                            defaultChecked={transaction.categoryId === (category.id)}
                                            onChange={() => {
                                                setTransactions((prev: TransactionType[]) =>
                                                    prev.map((prevTransaction: TransactionType) => {
                                                        if (prevTransaction.id === transaction.id) {
                                                            return {
                                                                ...prevTransaction,
                                                                categoryId: category.id,
                                                                categoryName: category.name
                                                            };
                                                        }
                                                        return prevTransaction;
                                                    })
                                                );
                                            }}
                                        />
                                        {category.name}
                                    </div>
                                </label>
                            )}

                            Bank Accounts:
                            {bankAccounts && bankAccounts.map(account =>
                                <label key={account.id} className="inline-flex gap-1 flex flex-col">

                                    <div className="inline-flex gap-1">
                                        <input
                                            name={`bankAccountSelect${transaction.id}`}
                                            required
                                            ref={financialAccountInputRef}
                                            type="radio"
                                            value={account.id}
                                            defaultChecked={transaction.financialAccountId === (account.id)}
                                            onChange={() => {
                                                setTransactions((prev: TransactionType[]) =>
                                                    prev.map((prevTransaction: TransactionType) => {
                                                        if (prevTransaction.id === transaction.id) {
                                                            return {
                                                                ...prevTransaction,
                                                                financialAccountId: account.id,
                                                                financialAccountName: account.name
                                                            };
                                                        }
                                                        return prevTransaction;
                                                    })
                                                );
                                            }}
                                        />
                                        {account.name}
                                    </div>
                                </label>
                            )}

                        </div>
                    )}
                    <div>
                        <Button text="Add Another" type="button" variant="primary-outline" extraClasses="inline-flex items-center" onClick={() => handleAddNewTransaction()}>
                            <PlusIcon className="size-6" />
                        </Button>
                    </div>
                </div>


                <div className="ml-auto pt-4 inline-flex gap-2">
                    {step > 1 &&
                        <div className="">
                            <Button text="Previous" variant="secondary" onClick={() => { setStep(step - 1); setError(null) }} />
                        </div>
                    }                

                    {(transactions.length === 1 && (
                        (!transactions[0].name || transactions[0].name.length === 0) &&
                        (!transactions[0].financialAccountId || transactions[0].financialAccountId.length === 0) &&
                        (!transactions[0].categoryId || transactions[0].categoryId.length === 0)
                    ) ?
                        <div className="">
                            <Button text="Skip" variant="primary" onClick={() => handleGoToNextStep()} />
                        </div>
                        :
                        <div className="">
                            <Button text="Next" variant="primary" onClick={() => checkInputValidationBeforeNext()} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}