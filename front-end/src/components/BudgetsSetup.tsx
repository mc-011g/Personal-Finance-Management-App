import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid"
import type { BudgetType, CategoryType } from "../types"
import Button from "./Button"
import Input from "./Input"
import { useRef } from "react"

interface BudgetsSetupProps {
    budgets: BudgetType[],
    setBudgets: React.Dispatch<React.SetStateAction<BudgetType[]>>,
    step: number,
    handleGoToNextStep: () => void,
    categories: CategoryType[],
    error: string | null,
    setStep: (number: number) => void,
    setError: (error: string | null) => void
}

export const BudgetsSetup = ({ setError, handleGoToNextStep, error, budgets, setBudgets, step, setStep, categories }: BudgetsSetupProps) => {

    const nameInputRef = useRef<HTMLInputElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);

    const handleAddNewBudget = () => {
        setBudgets([...budgets,
        {
            id: (budgets.length + 1).toString(),
            name: "",
            amount: 0,
            categoryIds: [],
            categoryDTOs: [],
            categoryNames: [],
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
        handleGoToNextStep();
    }

    const handleDeleteBudget = (id: string) => {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
    }

    return (
        <div className="mx-auto flex flex-col">
            <div className="py-4 inline-flex justify-between gap-4">
                <h2 className="text-2xl md:text-xl lg:text-lg font-bold">Add Monthly Budgets</h2>
                <h2 className="text-xl md:text-lg lg:text-md font-bold">Step {step} of 4</h2>
            </div>

            <div className="flex flex-col justify-between h-full">

                <div className="flex flex-col gap-4 w-full sm:w-96 md:w-128">

                    {budgets.map(budget =>
                        <div key={budget.id} className="relative p-4 border-1 border-gray-400 rounded-md flex flex-col gap-2">

                            {budgets.at(0)?.id !== budget.id &&
                                <button
                                    type="button"
                                    className="absolute top-4 right-4"
                                    onClick={() => handleDeleteBudget(budget.id)}
                                >
                                    <XMarkIcon className="size-6 text-gray-600 hover:text-black hover:cursor-pointer" />
                                </button>
                            }

                            <label className="flex flex-col gap-2 items-baseline">
                                Name:
                                <Input ref={nameInputRef} required maxLength={50} type="text" extraClasses="w-full" placeholder="Name" value={budget.name}
                                    onChange={e =>
                                        setBudgets((prev: BudgetType[]) =>
                                            prev.map((prevBudget: BudgetType) =>
                                                prevBudget.id === budget.id ?
                                                    { ...prevBudget, name: e.target.value } : prevBudget
                                            )
                                        )
                                    }
                                />
                            </label>

                            <label className="flex flex-col inline-flex gap-2 items-baseline">
                                Amount ($):
                                <Input ref={amountInputRef} required max={10000000000} type="number" extraClasses="w-full" placeholder="Balance" value={budget.amount}
                                    onChange={e =>
                                        setBudgets(prev =>
                                            prev.map(prevBudget =>
                                                prevBudget.id === budget.id ?
                                                    { ...prevBudget, amount: Number(e.target.value) } : prevBudget
                                            )
                                        )}
                                />
                            </label>

                            Categories:
                            {categories && categories.map(category =>
                                <label key={category.id} className="inline-flex gap-1">
                                    <input
                                        name="categorySelect"
                                        type="checkbox"
                                        value={category.id}
                                        checked={(budget.categoryNames || [])?.includes(category.name)}
                                        onChange={e => {

                                            setBudgets((prev: BudgetType[]) =>
                                                prev.map((prevBudget: BudgetType) => {
                                                    if (prevBudget.id === budget.id) {
                                                        let newCategoryNames: string[];
                                                        if (e.target.checked) {
                                                            newCategoryNames = [...(prevBudget.categoryNames || []), category.name];
                                                        } else {
                                                            newCategoryNames = (prevBudget.categoryNames || []).filter(categoryName => categoryName !== category.name);
                                                        }
                                                        return { ...prevBudget, categoryNames: newCategoryNames };
                                                    }
                                                    return prevBudget;

                                                })
                                            );
                                        }}
                                    />
                                    {category.name}
                                </label>
                            )}
                        </div>
                    )}
                    {error &&
                        <div className="text-red-600">
                            {error}
                        </div>
                    }
                    <div>
                        <Button text="Add Another" type="button" variant="primary-outline" extraClasses="inline-flex items-center" onClick={() => handleAddNewBudget()}>
                            <PlusIcon className="size-6" />
                        </Button>
                    </div>
                </div>


                <div className="ml-auto pt-4 inline-flex gap-2">
                    {step > 1 &&
                        <div className="">
                            <Button text="Previous" variant="secondary" onClick={() => { setStep(step - 1); setError(null); }} />
                        </div>
                    }

                    {(budgets.length === 1 && (
                        (!budgets[0].name || budgets[0].name.length === 0) &&
                        (!budgets[0].categoryIds || budgets[0].categoryIds.length === 0) &&
                        (!budgets[0].amount || budgets[0].amount === 0)
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